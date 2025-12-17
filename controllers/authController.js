import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from '../utils/sendEmail.js';
import path from "path";
import errorMessage from "../utils/error-message.js";
import dotenv from "dotenv";
dotenv.config();

const loginPage = async (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

const registerPage = async (req, res) => {
    res.render('auth/register', { title: 'Regiter' });
};

const forgotPasswordPage = async (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/login");    
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
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

        const jwtData = { id: user._id, role: user.role, name: user.name, email: user.email };
        const token = jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        req.flash("success", "Login Successful.");

        const redirectMap = {
            admin: "/admin",
            vendor: "/vendor",
            customer: "/"
        };

        res.redirect(redirectMap[user.role] || "/");

    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/register");    
    }
    const { name, email, phone, password, role } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            req.flash("error", "Email already exists.");
            req.flash("old", req.body);
            return res.redirect("/register");
        }
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
        next(errorMessage(error.message, 500));
    }
};

const forgotPassword = async (req, res) => {
    res.send('Forgot Password Functionality');
};

const logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

const verifyEmail = async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
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



export default {
    loginPage,
    login,
    registerPage,
    register,
    forgotPasswordPage,
    forgotPassword,
    logout,
    verifyEmail
};