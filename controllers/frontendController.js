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
                                        .populate('vendorId', 'name')
                                        .sort({ createdAt: -1 });
        const shops = await Shop.find({ isDeleted: false, status: "approved" }).limit(10);
        res.render("frontend/index", { vendors, products, shops, title: "Ecommerce - Online Shopping Website" });
    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};

const products = async (req, res, next) => {
    try {

        const { page = 1, limit = 9 } = req.query;

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

        const { search, category, shop, vendor } = req.query;

        let query = { status: "active", isDeleted: false };

        /* -------------------- BREADCRUMBS -------------------- */
        let breadcrumbs = [
            { label: 'Home', url: '/' },
            { label: 'Products', url: '/products' }
        ];

        /* -------------------- SEARCH -------------------- */
        if (search) {
            query.name = { $regex: search, $options: "i" };
            breadcrumbs.push({
                label: `Search: "${search}"`,
                url: null
            });
        }

        /* -------------------- CATEGORY (PARENT + SUB CATEGORIES) -------------------- */
        if (category) {
            const cat = await Category.findOne({ slug: category, isDeleted: false });
            if (!cat) {
                return next(errorMessage("Category not found", 404));
            }

            let categoryIds = [cat._id];

            // If parent category → include its sub-categories
            if (!cat.parentCategory) {
                const children = await Category.find({
                    parentCategory: cat._id,
                    isDeleted: false
                }).select('_id');

                categoryIds = categoryIds.concat(children.map(c => c._id));
            }

            query.categoryId = { $in: categoryIds };

            /* ---------- Breadcrumbs ---------- */
            const parts = category.split('/');
            let path = '';

            parts.forEach((part, index) => {
                path += (index === 0 ? part : '/' + part);

                breadcrumbs.push({
                    label: part
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase()),
                    url: index === parts.length - 1
                        ? null
                        : `/products?category=${encodeURIComponent(path)}`
                });
            });
        }


        /* -------------------- SHOP -------------------- */
        if (shop) {
            const sh = await Shop.findOne({ slug: shop, isDeleted: false, status: "approved" });
            if (!sh) {
                return next(errorMessage("Shop not found", 404));
            }

            query.shopId = sh._id;

            breadcrumbs.push({
                label: sh.name,
                url: null
            });
        }

        /* -------------------- VENDOR -------------------- */
        if (vendor) {
            const ven = await User.findOne({ _id: vendor, role: "vendor", isDeleted: false });
            if (!ven) {
                return next(errorMessage("Vendor not found", 404));
            }

            query.vendorId = ven._id;

            breadcrumbs.push({
                label: ven.name,
                url: null
            });
        }

        /* -------------------- PRODUCTS -------------------- */
        const products = await Product.paginate(query, options);

        let message = "";
        if (products.docs.length === 0) {
            message = "No record found.";
        }

        res.render("frontend/products", {
            title: 'Products',
            products: products.docs,

            /* UI */
            search: search || '',
            category: category || '',
            message,

            /* Pagination */
            totalDocs: products.totalDocs,
            limit: products.limit,
            totalPages: products.totalPages,
            page: products.page,
            pagingCounter: products.pagingCounter,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            nextPage: products.nextPage,
            prevPage: products.prevPage,

            /* Breadcrumbs */
            breadcrumbs
        });

    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};


const product = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            status: "active",
            isDeleted: false
        })
        .populate('categoryId', ['name', 'slug'])
        .populate('shopId', ['name', 'slug'])
        .populate('vendorId', ['name']);

        if (!product) {
            return next(errorMessage('Product not found.', 404));
        }

        /* -------------------- BREADCRUMBS -------------------- */
        let breadcrumbs = [
            { label: 'Home', url: '/' },
            { label: 'Products', url: '/products' }
        ];

        /* -------- CATEGORY (supports nested slugs) -------- */
        if (product.categoryId?.slug) {
            const parts = product.categoryId.slug.split('/');
            let path = '';

            parts.forEach((part, index) => {
                path += (index === 0 ? part : '/' + part);

                breadcrumbs.push({
                    label: part
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase()),
                    url: `/products?category=${path}`
                });
            });
        }

        /* -------- OPTIONAL: SHOP -------- */
        if (product.shopId?.slug) {
            breadcrumbs.push({
                label: product.shopId.name,
                url: `/products?shop=${product.shopId.slug}`
            });
        }

        /* -------- CURRENT PRODUCT -------- */
        breadcrumbs.push({
            label: product.name,
            url: null
        });

        res.render("frontend/product", {
            product,
            title: product.name,
            breadcrumbs
        });

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

const shops = async (req, res, next) => {
    try {
        const { page = 1, limit = 9 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'vendorId', select: 'name' }
            ]
        };

        const { search } = req.query;

        /* -------------------- SEARCH -------------------- */
        let query = { status: "approved", isDeleted: false };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const shops = await Shop.paginate(query, options);
        let message = "";
        if (shops.docs.length === 0) {
            message = "No record found.";
        }

        res.render("frontend/shops", {
            title: 'Shops',
            shops: shops.docs,

            /* UI */
            search: search || '',
            message,

            /* Pagination */
            totalDocs: shops.totalDocs,
            limit: shops.limit,
            totalPages: shops.totalPages,
            page: shops.page,
            pagingCounter: shops.pagingCounter,
            hasPrevPage: shops.hasPrevPage,
            hasNextPage: shops.hasNextPage,
            nextPage: shops.nextPage,
            prevPage: shops.prevPage,

        });

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const vendors = async (req, res, next) => {
    try {
        const { page = 1, limit = 9 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const { search } = req.query;

        /* -------------------- SEARCH -------------------- */
        let query = { role: "vendor", isDeleted: false };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const vendors = await User.paginate(query, options);
        let message = "";
        if (vendors.docs.length === 0) {
            message = "No record found.";
        }

        res.render("frontend/vendors", {
            title: 'Vendors',
            vendors: vendors.docs,

            /* UI */
            search: search || '',
            message,

            /* Pagination */
            totalDocs: vendors.totalDocs,
            limit: vendors.limit,
            totalPages: vendors.totalPages,
            page: vendors.page,
            pagingCounter: vendors.pagingCounter,
            hasPrevPage: vendors.hasPrevPage,
            hasNextPage: vendors.hasNextPage,
            nextPage: vendors.nextPage,
            prevPage: vendors.prevPage,

        });

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

export default {
    index,
    products,
    product,
    categoryRedirect,
    shopRedirect,
    vendorRedirect,
    shops,
    vendors
}