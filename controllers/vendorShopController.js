import Shop from "../models/Shop.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';
import path from 'path';
import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const shops = await Shop.find({ isDeleted: false, vendorId: req.user.id }).sort({ createdAt: -1 });
        res.render('vendor/shops', { shops, title: 'Shops' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
        res.render('vendor/shops/view', { shop, title: shop.name, timeAgo });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const create = async (req, res, next) => {
    try {
        res.render('vendor/shops/create', { title: 'Create Shop' });
    } catch (err) {
        return next(errorMessage("Something went wrong", 500));
    }
};

const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/vendor/shops/create");
    }

    try {
        const shop = new Shop(req.body); 
        shop.vendorId = req.user.id;
        shop.address.line1 = req.body.line1;
        shop.address.line2 = req.body.line2;
        shop.address.city = req.body.city;
        shop.address.state = req.body.state;
        shop.address.country = req.body.country;
        shop.logo = req.files?.logo ? req.files.logo[0].filename : null;
        shop.banner = req.files?.banner ? req.files.banner[0].filename : null;
        const saved = await shop.save();
        req.flash("success", "Shop created successfully.");
        return res.redirect("/vendor/shops");

    } catch (error) {
        // Duplicate key (slug or name+parentShop)
        if (error.code === 11000) {
            req.flash("error", "Shop already exists.");
            req.flash("old", req.body);
            return res.redirect("/vendor/shops/create");
        }
        return next(errorMessage(error.message, 500));
    }
};


const edit = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
        res.render('vendor/shops/edit', { shop, title: 'Edit Shop' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/vendor/shops/edit/${req.params.id}`);
    }

    const { name, description, email, phone, logo, banner, line1, line2, city, state, country } = req.body;
    try {
        const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
        
        shop.name = name || shop.name;
        shop.description = description || shop.description;
        shop.email = email || shop.email;
        shop.phone = phone || shop.phone;
        shop.address.line1 = line1 !== undefined ? line1 : shop.address.line1;
        shop.address.line2 = line2 !== undefined ? line2 : shop.address.line2;
        shop.address.city = city !== undefined ? city : shop.address.city;
        shop.address.state = state !== undefined ? state : shop.address.state;
        shop.address.country = country !== undefined ? country : shop.address.country;

        if (req.files?.logo && shop.logo) {
            const imagePath = path.join('./public/uploads/shops', shop.logo);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                req.flash("error", "Failed to delete previous logo.");
                req.flash("old", req.body);
                return res.redirect(`/vendor/shops/edit/${req.params.id}`);
            }
        }

        if (req.files?.banner && shop.banner) {
            const imagePath = path.join('./public/uploads/shops', shop.banner);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                req.flash("error", "Failed to delete previous banner.");
                req.flash("old", req.body);
                return res.redirect(`/vendor/shops/edit/${req.params.id}`);
            }
        }

        shop.logo = req.files?.logo ? req.files.logo[0].filename : shop.logo;
        shop.banner = req.files?.banner ? req.files.banner[0].filename : shop.banner;

        const saved = await shop.save();

        req.flash("success", "Shop updated successfully.");
        res.redirect("/vendor/shops");
    } catch (error) {
        if (error.code === 11000) {
            req.flash("error", "Shop already exists.");
            req.flash("old", req.body);
            return res.redirect("/vendor/shops/create");
        }
        next(errorMessage("Something went wrong", 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));

        // Soft delete
        shop.isDeleted = true;
        shop.deletedAt = new Date();
        await shop.save();

        req.flash("success", "Shop deleted successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const trashed = async (req, res, next) => {
    try {
        const shops = await Shop.find({ isDeleted: true, vendorId: req.user.id }).sort({ createdAt: -1 });
        res.render('vendor/shops/trashed', { shops, title: 'Trashed Shops' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!shop || !shop.isDeleted) return next(errorMessage('Shop not found.', 404));

        // Restore
        shop.isDeleted = false;
        shop.deletedAt = null;
        await shop.save();

        req.flash("success", "Shop restored successfully.");
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
