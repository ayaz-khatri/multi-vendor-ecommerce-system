import User from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { uploadImage, destroyImage } from '../services/cloudinaryFileUpload.js';
import bcrypt from "bcryptjs";

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
        if (!user || user.isDeleted) {
            return next(errorMessage('User not found.', 404));
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;

        // Profile image handling (Cloudinary)
        if (req.file) {
            // Delete old image if exists
            if (user.profilePic?.publicId) {
                await destroyImage(user.profilePic.publicId);
            }

            const image = await uploadImage(req.file, 'users');

            user.profilePic = {
                url: image?.url,
                publicId: image?.publicId
            };
        }

        await user.save();

        req.flash("success", "Profile updated successfully.");
        return res.redirect(`/profile/edit/${req.params.id}`);

    } catch (error) {
        return next(errorMessage("Something went wrong", 500));
    }
};


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
        next(errorMessage("Something went wrong", 500));
    }
}

export default {
    edit,
    update,
    passwordForm,
    passwordUpdate
}