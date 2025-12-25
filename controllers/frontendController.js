import User from "../models/User.js";
import errorMessage from "../utils/error-message.js";
// import { validationResult } from "express-validator";
// import path from 'path';
// import fs from 'fs';

const index = async (req, res, next) => {
    try {
        res.render("frontend/index", { title: "Ecommerce - Online Shopping Website" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index
}