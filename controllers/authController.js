import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from '../utils/sendEmail.js';
import errorMessage from "../utils/error-message.js";
import dotenv from "dotenv";
dotenv.config();

const loginPage = async (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

const registerPage = async (req, res) => {
    res.render('auth/register', { title: 'Register' });
};

const forgotPasswordPage = async (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
};

const resetPasswordPage = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            isDeleted: false,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(errorMessage('Invalid or expired link', 400));
        }

        res.render('auth/reset-password', { token: req.params.token, title: 'Reset Password' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
}

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/login");    
    }
    const { email, password, rememberMe } = req.body;
    try {
        const user = await User.findOne({ email, isDeleted: false }).select('+password');
        if (!user) {
            req.flash("error", "Email not found.");
            req.flash("old", req.body);
            return res.redirect("/login");
        }

        if (!user.isEmailVerified) {
            req.flash('error', 'Please verify your email first.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error", "Invalid Email or Password.");
            req.flash("old", req.body);
            return res.redirect("/login");
        }

        const tokenExpiry = rememberMe ? '30d' : '1d';
        const jwtData = { id: user._id, role: user.role, name: user.name, email: user.email };
        const token = jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
        const cookieOptions = { httpOnly: true, sameSite: 'strict' };
        if (rememberMe) cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        res.cookie('token', token, cookieOptions);
 
        req.flash("success", "Login Successful.");
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const redirectMap = {
            admin: "/admin",
            vendor: "/vendor",
            customer: "/"
        };

        res.redirect(redirectMap[user.role] || "/");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/register");    
    }
    const { name, email, phone, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            req.flash("error", "Email already exists.");
            req.flash("old", req.body);
            return res.redirect("/register");
        }

        const allowedRoles = ['customer', 'vendor'];
        const role = allowedRoles.includes(req.body.role) ? req.body.role : 'customer';

        const newUser = new User({ name, email, phone, password, role });
        const verificationToken = crypto.randomBytes(32).toString('hex');

        newUser.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await newUser.save();

        const verificationUrl = `${process.env.APP_URL}/verify-email/${verificationToken}`;

        await sendEmail({
            to: newUser.email,
            subject: 'Verify your email address',
            html: verificationEmailTemplate(newUser.name, verificationUrl)
        });

        console.log(verificationToken);
        req.flash("success", "Registration successful. Please check your email to verify your account.");
        res.redirect('/login');
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const forgotPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        return res.redirect("/forgot-password");    
    }

    const { email } = req.body;
    try {
        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            req.flash('success','If the email exists, a reset link has been sent.');
            return res.redirect('/forgot-password');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            html: resetPasswordTemplate(user.name, resetUrl)
        });

        req.flash('success','If the email exists, a reset link has been sent.');
        res.redirect('/forgot-password');
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

const verifyEmail = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            isDeleted: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
            isEmailVerified: false
        });

        if (!user) {
            return next(errorMessage("Invalid or expired token", 400));
        }

        if (user.isEmailVerified) {
            req.flash('success', 'Email already verified.');
            return res.redirect('/login');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();
        req.flash("success", "Email verified successfully.");
        res.redirect('/login');
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        return res.redirect(`/reset-password/${req.params.token}`);    
    }
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            isDeleted: false,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(errorMessage('Invalid or expired link', 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        req.flash('success', 'Password reset successful. Please log in.');
        res.redirect('/login');
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const verificationEmailTemplate = (name, url) => `
    <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${name},</h2>
        <p>Thank you for registering with <b>${process.env.APP_NAME}</b>.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p>
            <a href="${url}" 
               style="background:#28a745;color:#fff;padding:10px 15px;
               text-decoration:none;border-radius:5px;">
               Verify Email
            </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>Regards,<br/>Support Team</p>
    </div>
`;

const resetPasswordTemplate = (name, url) => `
    <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${name},</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to set a new password:</p>
        <p>
            <a href="${url}"
               style="background:#dc3545;color:#fff;
               padding:10px 15px;text-decoration:none;border-radius:5px;">
               Reset Password
            </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </div>
`;

export default {
    loginPage,
    login,
    registerPage,
    register,
    forgotPasswordPage,
    forgotPassword,
    logout,
    verifyEmail,
    resetPasswordPage,
    resetPassword
};