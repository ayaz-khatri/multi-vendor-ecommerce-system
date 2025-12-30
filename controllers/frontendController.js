import User from "../models/User.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Category from "../models/Category.js";
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

        const { search, category, shop, vendor } = req.query; // Get search and category from query parameters
        let query = { status: "active", isDeleted: false };

        // Search by product name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        // Filter by category (optional)
        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (!cat) {
                return next(errorMessage("Category not found", 404));
            }
            query.categoryId = cat._id;
        }

        if (shop) {
            const sh = await Shop.findOne({ slug: shop });
            if (!sh) {
                return next(errorMessage("Shop not found", 404));
            }
            query.shopId = sh._id;
        }

        if (vendor) {
            const ven = await User.findOne({ _id: vendor, role: "vendor" });
            if (!ven) {
                return next(errorMessage("Vendor not found", 404));
            }
            query.vendorId = ven._id;
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

const categoryRedirect = async (req, res, next) => {
    try {
        let slug = req.params.slug;
        slug = slug.join("/")
        const encodedSlug = encodeURIComponent(slug);
        res.redirect(`/products?category=${encodedSlug}`);
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const shopRedirect = async (req, res, next) => {
    try {
        let slug = req.params.slug;
        const encodedSlug = encodeURIComponent(slug);
        res.redirect(`/products?shop=${encodedSlug}`);
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const vendorRedirect = async (req, res, next) => {
    try {
        let slug = req.params.slug;
        const encodedSlug = encodeURIComponent(slug);
        res.redirect(`/products?vendor=${encodedSlug}`);
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

// const productsFromCategory = async (req, res, next) => {
//     let slug = req.params.slug;
//     slug = slug.join("/")
//     const category = await Category.findOne({ slug });
//     if (!category) return next(errorMessage("Category not found", 404));

//     req.query.category = category._id;
//     return products(req, res, next); // REUSE
// };




export default {
    index,
    products,
    product,
    categoryRedirect,
    shopRedirect,
    vendorRedirect
}