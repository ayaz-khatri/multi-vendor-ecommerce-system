import Category from "../models/Category.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';
import path from 'path';
import fs from 'fs';

const index = async (req, res, next) => {
    try {
        const categories = await Category.find({ isDeleted: false }).populate('parentCategory', 'name').sort({ createdAt: -1 });
        res.render('admin/categories', { categories, title: 'Categories' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).populate('parentCategory', 'name');
        if (!category || category.isDeleted) return next(errorMessage('Category not found.', 404));
        res.render('admin/categories/view', { category, title: category.name, timeAgo });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const create = async (req, res, next) => {
    try {
        const categories = await Category.find({ isDeleted: false, parentCategory: null }).sort({ name: 1 });
        res.render('admin/categories/create', { categories, title: 'Create Category' });
    } catch (err) {
        return next(errorMessage("Something went wrong", 500));
    }
};

const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/admin/categories/create");
    }

    try {
        const category = new Category(req.body); 
        category.parentCategory = req.body.parentCategory || null;
        category.icon = req.file ? req.file.filename : null;
        const saved = await category.save();
        req.flash("success", "Category created successfully.");
        return res.redirect("/admin/categories");

    } catch (error) {
        // Duplicate key (slug or name+parentCategory)
        if (error.code === 11000) {
            req.flash("error", "Category already exists in this level.");
            req.flash("old", req.body);
            return res.redirect("/admin/categories/create");
        }
        return next(errorMessage("Something went wrong", 500));
    }
};


const edit = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || category.isDeleted) return next(errorMessage('Category not found.', 404));
        const categories = await Category.find({ isDeleted: false, parentCategory: null, _id: { $ne: category._id } }).sort({ name: 1 });
        res.render('admin/categories/edit', { category, categories, title: 'Edit Category' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/admin/categories/edit/${req.params.id}`);
    }

    const { name, description, parentCategory } = req.body;
    try {
        const category = await Category.findById(req.params.id);
        if (!category || category.isDeleted) return next(errorMessage('Category not found.', 404));
        
        category.name = name || category.name;
        category.description = description || category.description;
        if (parentCategory === '') {
            category.parentCategory = null;
        } else if (parentCategory) {
            category.parentCategory = parentCategory;
        }

        if (req.file && category.icon) {
            const imagePath = path.join('./public/uploads/categories', category.icon);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                req.flash("error", "Failed to delete previous icon.");
                req.flash("old", req.body);
                return res.redirect(`/admin/categories/edit/${req.params.id}`);
            }
        }
        category.icon = req.file ? req.file.filename : category.icon;

        const saved = await category.save();

        req.flash("success", "Category updated successfully.");
        res.redirect("/admin/categories");
    } catch (error) {
        if (error.code === 11000) {
            req.flash("error", "Category already exists in this level.");
            req.flash("old", req.body);
            return res.redirect("/admin/categories/create");
        }
        next(errorMessage("Something went wrong", 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || category.isDeleted) return next(errorMessage('Category not found.', 404));

        // Soft delete
        category.isDeleted = true;
        category.deletedAt = new Date();
        await category.save();

        req.flash("success", "Category deleted successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const trashed = async (req, res, next) => {
    try {
        const categories = await Category.find({ isDeleted: true }).populate('parentCategory', 'name').sort({ createdAt: -1 });
        res.render('admin/categories/trashed', { categories, title: 'Trashed Categories' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !category.isDeleted) return next(errorMessage('Category not found.', 404));

        // Restore
        category.isDeleted = false;
        category.deletedAt = null;
        await category.save();

        req.flash("success", "Category restored successfully.");
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
