import Vendor from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";

const index = async (req, res, next) => {
    try 
    {
        const vendors = await Vendor.find({ role: 'vendor' })
                                        .select('-password')            
                                        .sort({ createdAt: -1 });
        // res.send({ vendors });
        res.render('admin/vendors', { vendors, title: 'Vendors' });
    } catch (err) {
        next(errorMessage(err.message, 500));
    }
};



const create = async (req, res) => {
    res.render('admin/vendors/create', {title: 'Create' });
};


const store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('admin/vendors/create', {
            errors: errors.array()
        });
    }
    try {
        const vendor = new Vendor(req.body);
        vendor.role = 'vendor';
        const saved = await vendor.save();
        res.redirect('/admin/vendors');
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


const edit = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return next(errorMessage('Vendor not found.', 404));
        res.render('admin/vendors/edit', { vendor, title: 'Edit' });
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const vendor = await Vendor.findById(req.params.id);
        return res.render('admin/vendors/update', {
            vendor,
            errors: errors.array()
        });
    }
    const { name, email, phone, password, role } = req.body;
    try {
        const vendor = await User.findById(req.params.id);
        if (!vendor) return next(errorMessage('Vendor not found.', 404));
        vendor.name = name || vendor.name;
        vendor.email = email || vendor.email;
        vendor.phone = phone || vendor.phone;
        vendor.password = password || vendor.password;
        vendor.role = role || vendor.role;
        const saved = await vendor.save();
        res.redirect('/admin/vendors');
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


const destroy = async (req, res, next) => {
    try {
        const vendor = await User.findById(req.params.id);
        if (!vendor) return next(errorMessage('Vendor not found.', 404));
        await Category.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


export default {
    index,
    create,
    store,
    edit,
    update,
    destroy
}
