import Vendor from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';

const index = async (req, res, next) => {
    try {
        const vendors = await Vendor.find({ role: 'vendor', isDeleted: false }).sort({ createdAt: -1 });
        res.render('admin/vendors', { vendors, title: 'Vendors' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
        // next(errorMessage(err.message, 500));
    }
};

const view = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));
        res.render('admin/vendors/view', { vendor, title: vendor.name, timeAgo });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const create = async (req, res) => {
    res.render('admin/vendors/create', { title: 'Create Vendor' });
};

const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/admin/vendors/create");
    }

    try {
        const user = await Vendor.findOne({ email: req.body.email });
        if (user) {
            req.flash("error", "Email already exists.");
            req.flash("old", req.body);
            return res.redirect("/admin/vendors/create");
        }

        const vendor = new Vendor(req.body);
        vendor.role = 'vendor';
        const saved = await vendor.save();

        req.flash("success", "Vendor created successfully.");
        res.redirect("/admin/vendors");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const edit = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));
        res.render('admin/vendors/edit', { vendor, title: 'Edit Vendor' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/admin/vendors/edit/${req.params.id}`);
    }

    const { name, email, phone, password } = req.body;
    try {
        const vendor = await Vendor.findById(req.params.id).select("+password");
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));

        if (email && email !== vendor.email) {
            const user = await Vendor.findOne({ email: req.body.email });
            if (user) {
                req.flash("error", "Email already exists.");
                req.flash("old", req.body);
                return res.redirect(`/admin/vendors/edit/${req.params.id}`);
            }
        }
        
        vendor.name = name || vendor.name;
        vendor.email = email || vendor.email;
        vendor.phone = phone || vendor.phone;
        vendor.password = password || vendor.password;
        const saved = await vendor.save();

        req.flash("success", "Vendor updated successfully.");
        res.redirect("/admin/vendors");
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));

        // Soft delete
        vendor.isDeleted = true;
        vendor.deletedAt = new Date();
        await vendor.save();

        req.flash("success", "Vendor deleted successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const trashed = async (req, res, next) => {
    try {
        const vendors = await Vendor.find({ role: 'vendor', isDeleted: true }).sort({ createdAt: -1 });
        res.render('admin/vendors/trashed', { vendors, title: 'Trashed Vendors' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor || !vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));

        // Restore
        vendor.isDeleted = false;
        vendor.deletedAt = null;
        await vendor.save();

        req.flash("success", "Vendor restored successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    view,
    create,
    store,
    edit,
    update,
    destroy,
    trashed,
    restore
}
