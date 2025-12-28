import User from "../models/User.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import errorMessage from "../utils/error-message.js";
// import { validationResult } from "express-validator";
// import path from 'path';
// import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const vendors = await User.find({ role: "vendor", isDeleted: false }).limit(10);
        const products = await Product.find({ isDeleted: false, status: "active" }).limit(8)
                                        .populate('shopId', ['name', 'slug'])
                                        .populate('categoryId', ['name', 'slug'])
                                        .populate('vendorId', 'name');
        const shops = await Shop.find({ isDeleted: false, status: "approved" }).limit(10);
        res.render("frontend/index", { vendors, products, shops, title: "Ecommerce - Online Shopping Website" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const products = async (req, res, next) => {
    try {

        const { page = 1, limit = 2 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'categoryId', select: 'name slug' },
                { path: 'shopId', select: 'name slug' },
                { path: 'vendorId', select: 'name' }
            ]
        };

        const { search, category } = req.query; // Get search and category from query parameters
        let query = { status: "active" };

        // Search by product name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        // Filter by category (optional)
        if (category) {
            query.categoryId = category;
        }

        const products = await Product.paginate(query, options);

        let message = "";
        if (products.docs.length === 0) {
            message = "No record found.";
        }

        res.render("frontend/products", { 
            products:       products.docs, 
            title:          'Products',
            search:         search || '',  // Pass search back to template
            category:       category || '',
            totalDocs:      products.totalDocs,
            limit:          products.limit,
            totalPages:     products.totalPages,
            page:           products.page,
            pagingCounter:  products.pagingCounter,
            hasPrevPage:    products.hasPrevPage,
            hasNextPage:    products.hasNextPage,
            nextPage:       products.nextPage,
            prevPage:       products.prevPage,
            message:        message
        });
    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};


const product = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, status: "active" })
                                        .populate('categoryId', ['name', 'slug'])
                                        .populate('shopId', ['name', 'slug'])
                                        .populate('vendorId', 'name');
        if (!product || product.isDeleted) return next(errorMessage('Product not found.', 404));
        res.render("frontend/product", { product, title: product.name });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};




export default {
    index,
    products,
    product
}