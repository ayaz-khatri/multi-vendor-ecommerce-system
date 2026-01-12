import Customer from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";
import { timeAgo } from '../utils/helper.js';

const index = async (req, res, next) => {
    try {
        const customers = await Customer.find({ role: 'customer', isDeleted: false }).sort({ createdAt: -1 });
        res.render('admin/customers', { customers, title: 'Customers' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.isDeleted) return next(errorMessage('Customer not found.', 404));
        res.render('admin/customers/view', { customer, title: customer.name, timeAgo });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const create = async (req, res) => {
    res.render('admin/customers/create', { title: 'Create Customer' });
};

const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect("/admin/customers/create");
    }

    try {
        const user = await Customer.findOne({ email: req.body.email });
        if (user) {
            req.flash("error", "Email already exists.");
            req.flash("old", req.body);
            return res.redirect("/admin/customers/create");
        }

        const customer = new Customer(req.body);
        customer.role = 'customer';
        const saved = await customer.save();

        req.flash("success", "Customer created successfully.");
        res.redirect("/admin/customers");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const edit = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.isDeleted) return next(errorMessage('Customer not found.', 404));
        res.render('admin/customers/edit', { customer, title: 'Edit customer' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(e => e.msg));
        req.flash("old", req.body);
        return res.redirect(`/admin/customers/edit/${req.params.id}`);
    }

    const { name, email, phone, password } = req.body;
    try {
        const customer = await Customer.findById(req.params.id).select("+password");
        if (!customer || customer.isDeleted) return next(errorMessage('customer not found.', 404));

        if (email && email !== customer.email) {
            const user = await Customer.findOne({ email: req.body.email });
            if (user) {
                req.flash("error", "Email already exists.");
                req.flash("old", req.body);
                return res.redirect(`/admin/customers/edit/${req.params.id}`);
            }
        }
        
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.phone = phone || customer.phone;
        customer.password = password || customer.password;
        const saved = await customer.save();

        req.flash("success", "Customer updated successfully.");
        res.redirect("/admin/customers");
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.isDeleted) return next(errorMessage('Customer not found.', 404));

        // Soft delete
        customer.isDeleted = true;
        customer.deletedAt = new Date();
        await customer.save();

        req.flash("success", "Customer deleted successfully.");
        res.json({ success: true });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const trashed = async (req, res, next) => {
    try {
        const customers = await Customer.find({ role: 'customer', isDeleted: true }).sort({ createdAt: -1 });
        res.render('admin/customers/trashed', { customers, title: 'Trashed Customers' });
    } catch (err) {
        next(errorMessage("Something went wrong", 500));
    }
};

const restore = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || !customer.isDeleted) return next(errorMessage('customer not found.', 404));

        // Restore
        customer.isDeleted = false;
        customer.deletedAt = null;
        await customer.save();

        req.flash("success", "Customer restored successfully.");
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
