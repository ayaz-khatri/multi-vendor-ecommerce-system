import Shop from "../models/Shop.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';
import path from 'path';
import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const shops = await Shop.find({ isDeleted: false }).populate('vendorId', 'name').sort({ createdAt: -1 });
        res.render('admin/shops', { shops, title: 'Shops' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('vendorId', 'name');
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
        res.render('admin/shops/view', { shop, title: shop.name, timeAgo });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const destroy = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
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
        const shops = await Shop.find({ isDeleted: true }).populate('vendorId', 'name').sort({ createdAt: -1 });
        res.render('admin/shops/trashed', { shops, title: 'Trashed Shops' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
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

const approve = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));

        // Restore
        shop.status = 'approved';
        await shop.save();

        req.flash("success", "Shop approved successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    view,
    destroy,
    trashed,
    restore,
    approve
}
