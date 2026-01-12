import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import errorMessage from "../utils/error-message.js";
import { timeAgo } from '../utils/helper.js';

const index = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false})
                                        .populate('shopId', 'name')
                                        .populate('categoryId', 'name')
                                        .populate('vendorId', 'name')
                                        .sort({ createdAt: -1 });
        res.render('admin/products', { products, title: 'Products' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id })
                                                .populate('categoryId', 'name')
                                                .populate('shopId', 'name')
                                                .populate('vendorId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        res.render('admin/products/view', { product, title: product.name, timeAgo });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const destroy = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
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
        const products = await Product.find({ isDeleted: true })
                                        .populate('shopId', 'name')
                                        .populate('categoryId', 'name')
                                        .populate('vendorId', 'name')
                                        .sort({ createdAt: -1 });
        res.render('admin/products/trashed', { products, title: 'Trashed Products' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
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
