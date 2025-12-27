import User from "../models/User.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";
// import { validationResult } from "express-validator";
// import path from 'path';
// import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const vendors = await User.find({ role: "vendor", isDeleted: false }).limit(10);
        const products = await Product.find({ isDeleted: false, status: "active" }).limit(8).populate('shopId', 'name').populate('categoryId', 'name').populate('vendorId', 'name');
        res.render("frontend/index", { vendors, products, title: "Ecommerce - Online Shopping Website" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const product = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, status: "active" })
                                                .populate('categoryId', ['name', 'slug'])
                                                .populate('shopId', 'name')
                                                .populate('vendorId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        res.render("frontend/product", { product, title: product.name });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    product
}