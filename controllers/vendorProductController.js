import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Category from "../models/Category.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { uploadImage, destroyImage } from '../services/cloudinaryFileUpload.js';
import { timeAgo } from '../utils/helper.js';

const MAX_IMAGES = 8;

const index = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false, vendorId: req.user.id })
                                        .populate('shopId', 'name')
                                        .populate('categoryId', 'name')
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
        next(errorMessage("Something went wrong", 500));
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
            if (req.files.length > MAX_IMAGES) {
                req.flash("error", `You can upload a maximum of ${MAX_IMAGES} images per product.`);
                req.flash("old", req.body);
                return res.redirect("/vendor/products/create");
            }

            const uploadedImages = [];
            for (const file of req.files) {
                const img = await uploadImage(file, 'products');
                uploadedImages.push({
                    url: img.url,
                    publicId: img.publicId
                });
            }
            product.images = uploadedImages;
        }

        // Handle attributes array
        if (attributes) {
            const attrsArray = Array.isArray(attributes) ? attributes : [attributes];
            const filteredAttrs = attrsArray.filter(attr => attr.key?.trim() || attr.value?.trim());
            product.attributes = filteredAttrs.map(attr => ({
                key: attr.key,
                value: attr.value
            }));
        } else {
            product.attributes = [];
        }

        await product.save();

        req.flash("success", "Product created successfully.");
        return res.redirect("/vendor/products");

    } catch (error) {
        if (error.code === 11000) {
            req.flash("error", "Product already exists.");
            req.flash("old", req.body);
            return res.redirect("/vendor/products/create");
        }
        next(errorMessage("Something went wrong", 500));
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

            if (totalImages > MAX_IMAGES) {
                req.flash("error", `You can upload a maximum of ${MAX_IMAGES} images per product.`);
                req.flash("old", req.body);
                return res.redirect(`/vendor/products/edit/${req.params.id}`);
            }

            const uploadedImages = [];
            for (const file of req.files) {
                const img = await uploadImage(file, 'products');
                uploadedImages.push({
                    url: img.url,
                    publicId: img.publicId
                });
            }

            product.images = product.images.concat(uploadedImages);
        }

        // Handle removed images
        if (req.body.removeImages) {
            const removeImages = Array.isArray(req.body.removeImages)
                ? req.body.removeImages
                : [req.body.removeImages];

            product.images = product.images.filter(img => !removeImages.includes(img.publicId));

            for (const publicId of removeImages) {
                await destroyImage(publicId);
            }
        }

        // Handle attributes array
        if (attributes) {
            const attrsArray = Array.isArray(attributes) ? attributes : [attributes];
            const filteredAttrs = attrsArray.filter(attr => attr.key?.trim() || attr.value?.trim());
            product.attributes = filteredAttrs.map(attr => ({
                key: attr.key,
                value: attr.value
            }));
        } else {
            product.attributes = [];
        }

        await product.save();

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
        const products = await Product.find({ isDeleted: true, vendorId: req.user.id })
                                        .populate('shopId', 'name')
                                        .populate('categoryId', 'name')
                                        .sort({ createdAt: -1 });
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
