import User from "../models/User.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";
// import { validationResult } from "express-validator";
// import path from 'path';
// import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const vendors = await User.find({ role: "vendor", isDeleted: false }).limit(10);
        const products = await Product.find({ isDeleted: false }).limit(8).populate('shopId', 'name').populate('categoryId', 'name').populate('vendorId', 'name');
        // res.send(products);
        res.render("frontend/index", { vendors, products, title: "Ecommerce - Online Shopping Website" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index
}