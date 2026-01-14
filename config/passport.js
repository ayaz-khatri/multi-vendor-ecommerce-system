import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (user) {
            // Link Google account if not linked
            if (!user.googleId) {
                user.googleId = profile.id;
                user.authProvider = 'google';
                user.isEmailVerified = true;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // Create new Google user
            user = await User.create({
                name: profile.displayName,
                email,
                googleId: profile.id,
                authProvider: 'google',
                profilePic: profile.photos?.[0]?.value,
                isEmailVerified: true
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// REQUIRED for sessions
passport.serializeUser((user, done) => {
    done(null, user._id); // store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

