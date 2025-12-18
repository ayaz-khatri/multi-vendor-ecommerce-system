import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import vendorController from '../controllers/vendorController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';
// import upload from '../middlewares/multer.js';
import isValid from '../middlewares/validation.js';
import errorMessage from "../utils/error-message.js";

router.use(isLoggedIn);
router.use(isAdmin);

// User CRUD Routes
router.get('/', (req, res)=> {
    res.render('admin/dashboard', { title: 'Dashboard' });
});

router.get('/vendors', vendorController.index);
router.get('/vendors/view/:id', vendorController.view);
router.get('/vendors/create', vendorController.create);
router.post('/vendors', isValid.vendorValidation, vendorController.store);
router.get('/vendors/edit/:id', vendorController.edit);
router.post('/vendors/:id', isValid.vendorUpdateValidation, vendorController.update);
router.delete('/vendors/:id', vendorController.destroy);
router.get('/vendors/trashed', vendorController.trashed);
router.post('/vendors/restore/:id', vendorController.restore);


// system reset script route
router.get('/reset-system', async (req, res, next) => {
    try {
        // 1. Remove all users
        await User.deleteMany({});

        // 2. Create users
        const users = [
            {
                name: 'Admin',
                email: 'admin@admin.com',
                phone: '123456789',
                password: 'password',
                role: 'admin',
                isEmailVerified: true
            },
            {
                name: 'Vendor',
                email: 'vendor@vendor.com',
                phone: '123456789',
                password: 'password',
                role: 'vendor',
                isEmailVerified: true
            },
            {
                name: 'Customer',
                email: 'customer@customer.com',
                phone: '123456789',
                password: 'password',
                role: 'customer',
                isEmailVerified: true
            }
        ];

        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }

        // 3. Logout current user
        res.clearCookie('token');

        req.flash("success", "System reset successful.");
        res.redirect("/login");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
});



export default router;
