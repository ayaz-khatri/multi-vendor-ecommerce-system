import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Category from '../models/Category.js';
import vendorController from '../controllers/vendorController.js';
import categoryController from '../controllers/categoryController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';
import isValid from '../middlewares/validation.js';
import errorMessage from "../utils/error-message.js";
import createUploader from '../middlewares/multer.js';
const uploadCategoryIcon = createUploader('categories');

router.use(isLoggedIn);
router.use(isAdmin);

// User CRUD Routes
router.get('/', (req, res)=> {
    res.render('admin/dashboard', { title: 'Dashboard' });
});

// Vendor Routes
router.get('/vendors', vendorController.index);
router.get('/vendors/view/:id', vendorController.view);
router.get('/vendors/create', vendorController.create);
router.post('/vendors', isValid.vendorValidation, vendorController.store);
router.get('/vendors/edit/:id', vendorController.edit);
router.post('/vendors/:id', isValid.vendorUpdateValidation, vendorController.update);
router.delete('/vendors/:id', vendorController.destroy);
router.get('/vendors/trashed', vendorController.trashed);
router.post('/vendors/restore/:id', vendorController.restore);


// Category Routes
router.get('/categories', categoryController.index);
router.get('/categories/view/:id', categoryController.view);
router.get('/categories/create', categoryController.create);
router.post('/categories', uploadCategoryIcon.single('icon'), isValid.categoryValidation, categoryController.store);
router.get('/categories/edit/:id', categoryController.edit);
router.post('/categories/:id', uploadCategoryIcon.single('icon'), isValid.categoryValidation, categoryController.update);
router.delete('/categories/:id', categoryController.destroy);
router.get('/categories/trashed', categoryController.trashed);
router.post('/categories/restore/:id', categoryController.restore);


// system reset script route
router.get('/reset-system', async (req, res, next) => {
    try {
        // Remove all
        await User.deleteMany({});
        await Category.deleteMany({});

        // Default Users
        const users = [
            { name: 'Admin', email: 'admin@admin.com', phone: '123456789', password: 'password', role: 'admin', isEmailVerified: true },
            { name: 'Vendor', email: 'vendor@vendor.com', phone: '123456789', password: 'password', role: 'vendor', isEmailVerified: true},
            { name: 'Customer', email: 'customer@customer.com', phone: '123456789', password: 'password', role: 'customer', isEmailVerified: true }
        ];

        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }

        // Default Categories
        const electronics = new Category({ name: 'Electronics', parentCategory: null });
        await electronics.save();

        const fashion = new Category({ name: 'Fashion', parentCategory: null });
        await fashion.save();

        const home = new Category({ name: 'Home & Living', parentCategory: null });
        await home.save();

        const categories = [
            { name: 'Smartphones', parentCategory: electronics._id },
            { name: 'Laptops', parentCategory: electronics._id },
            { name: 'Men', parentCategory: fashion._id },
            { name: 'Women', parentCategory: fashion._id },
            { name: 'Furniture', parentCategory: home._id },
            { name: 'Kitchen', parentCategory: home._id }
        ];

        for (const data of categories) {
            const category = new Category(data);
            await category.save();
        }

        // Logout current user
        res.clearCookie('token');
        req.flash("success", "System reset successful.");
        res.redirect("/login");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
});



export default router;
