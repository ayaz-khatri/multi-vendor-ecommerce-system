import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Category from '../models/Category.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import adminVendorController from '../controllers/adminVendorController.js';
import adminCustomerController from '../controllers/adminCustomerController.js';
import adminCategoryController from '../controllers/adminCategoryController.js';
import adminShopController from '../controllers/adminShopController.js';
import adminProductController from '../controllers/adminProductController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';
import isValid from '../middlewares/validation.js';
import errorMessage from "../utils/error-message.js";
import createUploader from '../middlewares/multer.js';
const uploadCategoryIcon = createUploader('categories');

router.use(isLoggedIn);
router.use(isAdmin);

// User CRUD Routes
router.get('/', async (req, res, next) => {
    try {
        const vendors = await User.find({ role: 'vendor', isDeleted: false });
        const customers = await User.find({ role: 'customer', isDeleted: false });
        const shops = await Shop.find({ isDeleted: false });
        const products = await Product.find({ isDeleted: false });
        res.render('admin/dashboard', { 
                        vendorCount: vendors.length, 
                        customerCount: customers.length, 
                        shopCount: shops.length, 
                        productCount: products.length, 
                        title: 'Dashboard' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
});

// Vendor Routes
router.get('/vendors', adminVendorController.index);
router.get('/vendors/view/:id', adminVendorController.view);
router.get('/vendors/create', adminVendorController.create);
router.post('/vendors', isValid.vendorValidation, adminVendorController.store);
router.get('/vendors/edit/:id', adminVendorController.edit);
router.post('/vendors/:id', isValid.vendorUpdateValidation, adminVendorController.update);
router.delete('/vendors/:id', adminVendorController.destroy);
router.get('/vendors/trashed', adminVendorController.trashed);
router.post('/vendors/restore/:id', adminVendorController.restore);

// Customer Controller
router.get('/customers', adminCustomerController.index);
router.get('/customers/view/:id', adminCustomerController.view);
router.get('/customers/create', adminCustomerController.create);
router.post('/customers', isValid.vendorValidation, adminCustomerController.store);
router.get('/customers/edit/:id', adminCustomerController.edit);
router.post('/customers/:id', isValid.vendorUpdateValidation, adminCustomerController.update);
router.delete('/customers/:id', adminCustomerController.destroy);
router.get('/customers/trashed', adminCustomerController.trashed);
router.post('/customers/restore/:id', adminCustomerController.restore);

// Category Routes
router.get('/categories', adminCategoryController.index);
router.get('/categories/view/:id', adminCategoryController.view);
router.get('/categories/create', adminCategoryController.create);
router.post('/categories', uploadCategoryIcon.single('icon'), isValid.categoryValidation, adminCategoryController.store);
router.get('/categories/edit/:id', adminCategoryController.edit);
router.post('/categories/:id', uploadCategoryIcon.single('icon'), isValid.categoryValidation, adminCategoryController.update);
router.delete('/categories/:id', adminCategoryController.destroy);
router.get('/categories/trashed', adminCategoryController.trashed);
router.post('/categories/restore/:id', adminCategoryController.restore);

// Shop Routes
router.get('/shops', adminShopController.index);
router.get('/shops/view/:id', adminShopController.view);
router.delete('/shops/:id', adminShopController.destroy);
router.get('/shops/trashed', adminShopController.trashed);
router.post('/shops/restore/:id', adminShopController.restore);
router.post('/shops/approve/:id', adminShopController.approve);

router.get('/products', adminProductController.index);
router.get('/products/view/:id', adminProductController.view);
router.delete('/products/:id', adminProductController.destroy);
router.get('/products/trashed', adminProductController.trashed);
router.post('/products/restore/:id', adminProductController.restore);
router.post('/products/approve/:id', adminProductController.approve);

// system reset script route
router.get('/reset-system', async (req, res, next) => {
    try {
        // Remove all
        await User.deleteMany({});
        await Category.deleteMany({});
        await Shop.deleteMany({});
        await Product.deleteMany({});

        // Default Users
        const admin = new User({ name: 'Admin', email: 'admin@admin.com', phone: '123456789', password: 'password', role: 'admin', isEmailVerified: true });
        await admin.save();

        const vendor = new User({ name: 'Vendor', email: 'vendor@vendor.com', phone: '123456789', password: 'password', role: 'vendor', isEmailVerified: true });
        await vendor.save();

        const customer = new User({ name: 'Customer', email: 'customer@customer.com', phone: '123456789', password: 'password', role: 'customer', isEmailVerified: true });
        await customer.save();

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

        // Default Shops
        const shop1 = new Shop({
            vendorId: vendor._id,
            name: 'Urban Style Store',
            description: 'A modern fashion shop offering trendy urban clothing.',
            email: 'urbanstyle@shop.com',
            phone: '03001234567',
            address: {city: 'Lahore',country: 'Pakistan'},
            status: 'approved'
        });
        await shop1.save();

        const shop2 = new Shop({
            vendorId: vendor._id,
            name: 'Tech World Hub',
            description: 'Electronics and gadgets store with latest technology.',
            email: 'techworld@shop.com',
            phone: '03219876543',
            address: {city: 'Karachi', country: 'Pakistan'},
            status: 'pending'
        });
        await shop2.save();

        const shop3 = new Shop({
            vendorId: vendor._id,
            name: 'Home Comforts',
            description: 'Quality home and kitchen essentials.',
            email: 'homecomforts@shop.com',
            phone: '03335558899',
            address: {city: 'Faisalabad',country: 'Pakistan'},
            status: 'approved'
        });
        await shop3.save();

        // Default Products
        const product1 = new Product({
            shopId: shop1._id,
            vendorId: vendor._id,
            categoryId: fashion._id,
            name: 'Casual Shirt',
            slug: 'casual-shirt',
            sku: 'CS123',
            slug: 'casual-shirt',
            description: 'A casual shirt for men and women.',
            price: 19.99,
            discountPrice: null,
            stock: 50,
            status: 'active',
            attributes: [
                { key: 'Color', value: 'Red' },
                { key: 'Size', value: 'M' }
            ]
        });
        await product1.save();

        const product2 = new Product({
            shopId: shop1._id,
            vendorId: vendor._id,
            categoryId: fashion._id,
            name: 'Formal Dress',
            slug: 'formal-dress',
            sku: 'FD123',
            slug: 'formal-dress',
            description: 'A formal dress for women.',
            price: 49.99,
            discountPrice: null,
            stock: 30,
            status: 'active',
            attributes: [
                { key: 'Color', value: 'Black' },
                { key: 'Size', value: 'L' }
            ]
        });
        await product2.save();

        const product3 = new Product({
            shopId: shop2._id,
            vendorId: vendor._id,
            categoryId: electronics._id,
            name: 'Smartphone',
            slug: 'smartphone',
            sku: 'SP123',
            slug: 'smartphone',
            description: 'A high-end smartphone with advanced features.',
            price: 999.99,
            discountPrice: null,
            stock: 20,
            status: 'active',
            attributes: [
                { key: 'Color', value: 'Black' },
                { key: 'Storage', value: '128GB' }
            ]
        });
        await product3.save();

        // Logout current user
        res.clearCookie('token');
        req.flash("success", "System reset successful.");
        res.redirect("/login");

    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
});



export default router;
