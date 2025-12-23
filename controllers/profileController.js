import User from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import path from 'path';
import fs from 'fs';


const edit = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) return next(errorMessage('User not found.', 404));
        res.render('profile/edit', { user, title: 'Edit Profile' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
}

const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/profile/edit/${req.params.id}`);
    }

    const { name, phone } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) return next(errorMessage('User not found.', 404));

        user.name = name || user.name;
        user.phone = phone || user.phone;

         if (req.file && user.profilePic) {
            const imagePath = path.join('./public/uploads/users', user.profilePic);
            try {
                await fs.promises.unlink(imagePath);
            } catch (error) {
                req.flash("error", "Failed to delete previous profile pic.");
                req.flash("old", req.body);
                return res.redirect(`/profile/edit/${req.params.id}`);
            }
        }
        user.profilePic = req.file ? req.file.filename : user.profilePic;

        const saved = await user.save();

        req.flash("success", "Profile updated successfully.");
        res.redirect("/profile/edit/" + req.params.id);

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
}

const passwordForm = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) return next(errorMessage('User not found.', 404));
        res.render('profile/password', { user, title: 'Change Password' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
}

const passwordUpdate = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/profile/password/${req.params.id}`);
    }

    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id).select('+password');
        if (!user || user.isDeleted) return next(errorMessage('User not found.', 404));

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            req.flash("error", "Invalid old password.");
            req.flash("old", req.body);
            return res.redirect(`/profile/password/${req.params.id}`);
        }

        user.password = newPassword;
        const saved = await user.save();

        req.flash("success", "Password updated successfully. Please login with new password.");
        res.clearCookie('token');
        res.redirect('/login');

    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
}

export default {
    edit,
    update,
    passwordForm,
    passwordUpdate
}