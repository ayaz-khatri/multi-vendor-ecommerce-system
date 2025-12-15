import Vendor from "../models/User.js";
import errorMessage from "../utils/error-message.js";
import { validationResult } from "express-validator";

const index = async (req, res, next) => {
    try 
    {
        const vendors = await Vendor.find({ role: 'vendor', isDeleted: false })
                                        .select('-password')            
                                        .sort({ createdAt: -1 });
        // res.send({ vendors });
        res.render('admin/vendors', { vendors, title: 'Vendors' });
    } catch (err) {
        next(errorMessage(err.message, 500));
    }
};



const create = async (req, res) => {
    res.render('admin/vendors/create', {title: 'Create Vendor' });
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
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));
        res.render('admin/vendors/edit', { vendor, title: 'Edit Vendor' });
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


const update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const vendor = await Vendor.findById(req.params.id);
        return res.render('admin/vendors/edit', {
            vendor,
            errors: errors.array()
        });
    }
    const { name, email, phone, password } = req.body;
    try {
        const vendor = await Vendor.findById(req.params.id).select('+password');
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));
        vendor.name = name || vendor.name;
        vendor.email = email || vendor.email;
        vendor.phone = phone || vendor.phone;
        vendor.password = password || vendor.password;
        const saved = await vendor.save();
        res.redirect('/admin/vendors');
    } catch (error) {
        next(errorMessage(error.message, 500));
    }
};


const destroy = async (req, res, next) => {
    try {
       const vendor = await Vendor.findById(req.params.id);
        if (!vendor || vendor.isDeleted) return next(errorMessage('Vendor not found.', 404));

        // Soft delete
        vendor.isDeleted = true;
        vendor.deletedAt = new Date();
        await vendor.save();

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
