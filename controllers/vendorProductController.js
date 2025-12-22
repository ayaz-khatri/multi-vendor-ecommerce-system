import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Category from "../models/Category.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';
import path from 'path';
import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false, vendorId: req.user.id })
                                        .populate('shopId', 'name')
                                        .sort({ createdAt: -1 });
        res.render('vendor/products', { products, title: 'Products' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id }).populate('categoryId', 'name').populate('shopId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        res.render('vendor/products/view', { product, title: product.name, timeAgo });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const create = async (req, res, next) => {
    try {
        const shops = await Shop.find({ isDeleted: false, vendorId: req.user.id });
        const categories = await Category.find({ isDeleted: false });
        res.render('vendor/products/create', { shops, categories, title: 'Create Product' });
    } catch (error) {
        return next(errorMessage("Something went wrong", 500));
    }
};

const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/vendor/products/create");
    }

    try {
        const product = new Product(req.body); 
        product.vendorId = req.user.id;
        const saved = await product.save();
        req.flash("success", "Product created successfully.");
        return res.redirect("/vendor/products");

    } catch (error) {
        console.log(error);
        // Duplicate key (slug or name)
        if (error.code === 11000) {
            req.flash("error", "Product already exists.");
            req.flash("old", req.body);
            return res.redirect("/vendor/products/create");
        }
        return next(errorMessage("Something went wrong", 500));
    }
};


const edit = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id }).populate('shopId', 'name').populate('categoryId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        const shops = await Shop.find({ isDeleted: false, vendorId: req.user.id });
        const categories = await Category.find({ isDeleted: false });

        res.render('vendor/products/edit', { product, shops, categories, title: 'Edit Product' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/vendor/products/edit/${req.params.id}`);
    }

    const { name, description, shopId, price, discountPrice, stock, categoryId, status, sku,  } = req.body;
    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id }).populate('shopId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        
        product.name = name || shop.name;
        product.description = description || shop.description;
        product.shopId = shopId || product.shopId;
        product.price = price || product.price;
        product.discountPrice = discountPrice || product.discountPrice;
        product.stock = stock || product.stock;
        product.categoryId = categoryId || product.categoryId;
        product.status = status || product.status;
        product.sku = sku || product.sku;

        const saved = await product.save();

        req.flash("success", "Product updated successfully.");
        return res.redirect("/vendor/products");
    } catch (error) {
        if (error.code === 11000) {
            req.flash("error", "Product already exists.");
            req.flash("old", req.body);
            return res.redirect(`/vendor/products/edit/${req.params.id}`);
        }
        next(errorMessage("Something went wrong", 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));

        // Soft delete
        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();

        req.flash("success", "Product deleted successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const trashed = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: true, vendorId: req.user.id }).populate('shopId', 'name').sort({ createdAt: -1 });
        res.render('vendor/products/trashed', { products, title: 'Trashed Products' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!product || !product.isDeleted) return next(errorMessage('Product not found.', 404));

        // Restore
        product.isDeleted = false;
        product.deletedAt = null;
        await product.save();

        req.flash("success", "Product restored successfully.");
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
