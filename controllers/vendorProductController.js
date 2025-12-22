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
        const { name, price, stock, shopId, categoryId, sku, discountPrice, status, description, attributes } = req.body;

        const product = new Product({
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            shopId,
            categoryId,
            sku,
            discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
            status,
            description,
            vendorId: req.user.id
        });

        // Handle multiple images
        if (req.files && req.files.length > 0) {
            if (req.files.length > 8) {
                // Delete uploaded files to avoid orphan files
                req.files.forEach(file => {
                    fs.unlinkSync(path.join('./public/uploads/products', file.filename));
                });
                req.flash("error", "You can upload a maximum of 8 images per product.");
                req.flash("old", req.body);
                return res.redirect("/vendor/products/create");
            }

            product.images = req.files.map(file => file.filename);
        }

        // Handle attributes array
        if (attributes) {
            const attrsArray = Array.isArray(attributes) ? attributes : [attributes];
            // Filter out empty attributes
            const filteredAttrs = attrsArray.filter(attr => attr.key?.trim() || attr.value?.trim());
            product.attributes = filteredAttrs.map(attr => ({
                key: attr.key,
                value: attr.value
            }));
        } else {
            // If attributes not sent, remove all existing attributes
            product.attributes = [];
        }
        
        await product.save();

        req.flash("success", "Product created successfully.");
        return res.redirect("/vendor/products");

    } catch (error) {
        console.error(error);
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

    try {
        const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));

        const { name, description, shopId, price, discountPrice, status, stock, categoryId, sku, attributes } = req.body;

        // Update basic fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.shopId = shopId || product.shopId;
        product.price = price !== undefined ? parseFloat(price) : product.price;
        product.discountPrice = discountPrice ? parseFloat(discountPrice) : product.discountPrice;
        product.status = status || product.status;
        product.stock = stock !== undefined ? parseInt(stock, 10) : product.stock;
        product.categoryId = categoryId || product.categoryId;
        product.sku = sku || product.sku;

        // Handle new uploaded images
        if (req.files && req.files.length > 0) {
            const totalImages = product.images.length + req.files.length;

            if (totalImages > 8) {
                // Delete uploaded files to avoid orphan files
                req.files.forEach(file => {
                    fs.unlinkSync(path.join('./public/uploads/products', file.filename));
                });

                req.flash("error", "You can upload a maximum of 8 images per product.");
                req.flash("old", req.body);
                return res.redirect(`/vendor/products/edit/${req.params.id}`);
            }

            const newImages = req.files.map(file => file.filename);
            product.images = product.images.concat(newImages);
        }

        // Handle attributes array
        if (attributes) {
            const attrsArray = Array.isArray(attributes) ? attributes : [attributes];
            // Filter out empty attributes
            const filteredAttrs = attrsArray.filter(attr => attr.key?.trim() || attr.value?.trim());
            product.attributes = filteredAttrs.map(attr => ({
                key: attr.key,
                value: attr.value
            }));
        } else {
            // Remove all attributes if not sent
            product.attributes = [];
        }

        if (req.body.removeImages) {
            const removeImages = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
            product.images = product.images.filter(img => !removeImages.includes(img));
            removeImages.forEach(img => {
                const imgPath = path.join('./public/uploads/products', img);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        }
        await product.save();
        req.flash("success", "Product updated successfully.");
        return res.redirect("/vendor/products");

    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            req.flash("error", "Product already exists.");
            req.flash("old", req.body);
            return res.redirect(`/vendor/products/edit/${req.params.id}`);
        }
        return next(errorMessage("Something went wrong", 500));
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
