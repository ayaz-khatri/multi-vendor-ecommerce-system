import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Category from '../models/Category.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import VendorOrder from '../models/VendorOrder.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import adminVendorController from '../controllers/adminVendorController.js';
import adminCustomerController from '../controllers/adminCustomerController.js';
import adminCategoryController from '../controllers/adminCategoryController.js';
import adminShopController from '../controllers/adminShopController.js';
import adminProductController from '../controllers/adminProductController.js';
import adminOrderController from '../controllers/adminOrderController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';
import isValid from '../middlewares/validation.js';
import errorMessage from "../utils/error-message.js";
import createUploader from '../middlewares/multer.js';
const uploadCategoryIcon = createUploader('categories');

router.use(isLoggedIn);
router.use(isAdmin);

router.get('/', async (req, res, next) => {
    try {
        // User stats
        const [vendors, customers] = await Promise.all([
            User.countDocuments({ role: 'vendor', isDeleted: false }),
            User.countDocuments({ role: 'customer', isDeleted: false })
        ]);

        // Shop & Product stats
        const [shops, products, categories] = await Promise.all([
            Shop.countDocuments({ isDeleted: false }),
            Product.countDocuments({ isDeleted: false }),
            Category.countDocuments({ isDeleted: false })
        ]);

        // Order stats
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$overallStatus", "completed"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$overallStatus", "cancelled"] }, 1, 0]
                        }
                    },
                    partiallyCompleted: {
                        $sum: {
                            $cond: [{ $eq: ["$overallStatus", "partially_completed"] }, 1, 0]
                        }
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$overallStatus", "completed"] }, "$totalPrice", 0]
                        }
                    }
                }
            }
        ]);

        const stats = orders[0] || {
            totalOrders: 0,
            completed: 0,
            cancelled: 0,
            partiallyCompleted: 0,
            totalRevenue: 0
        };

        res.render('admin/dashboard', { 
            vendorCount: vendors,
            customerCount: customers,
            shopCount: shops,
            productCount: products,
            categoryCount: categories,
            orderCount: stats.totalOrders,
            completedOrderCount: stats.completed,
            cancelledOrderCount: stats.cancelled,
            partiallyCompletedOrderCount: stats.partiallyCompleted,
            totalRevenue: stats.totalRevenue,
            title: 'Dashboard'
        });
        
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

router.get('/orders', adminOrderController.index);
router.get('/orders/view/:id', adminOrderController.view);
router.post('/orders/cancel/:id', adminOrderController.cancel);

// system reset script route
router.get('/reset-system', async (req, res, next) => {
  try {
    /* =======================
       CLEAR DATABASE
    ======================= */
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      VendorOrder.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({})
    ]);

    /* =======================
       USERS
    ======================= */
    const users = await User.insertMany([
      // Admin
      {
        name: 'System Admin',
        email: 'admin@admin.com',
        phone: '03000000001',
        password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', // password
        role: 'admin',
        isEmailVerified: true
      },

      // Vendors
      {
        name: 'Ali Electronics',
        email: 'ali@vendors.com',
        phone: '03000000002',
        password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva',
        role: 'vendor',
        isEmailVerified: true
      },
      {
        name: 'Sara Fashion',
        email: 'sara@vendors.com',
        phone: '03000000003',
        password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva',
        role: 'vendor',
        isEmailVerified: true
      },
      {
        name: 'Usman Home',
        email: 'usman@vendors.com',
        phone: '03000000004',
        password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva',
        role: 'vendor',
        isEmailVerified: true
      },

      // Customers (6)
      { name: 'Ahmed Khan', email: 'ahmed@gmail.com', phone: '03000000005', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true },
      { name: 'Ayesha Malik', email: 'ayesha@gmail.com', phone: '03000000006', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true },
      { name: 'Bilal Ahmad', email: 'bilal@gmail.com', phone: '03000000007', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true },
      { name: 'Fatima Noor', email: 'fatima@gmail.com', phone: '03000000008', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true },
      { name: 'Hassan Raza', email: 'hassan@gmail.com', phone: '03000000009', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true },
      { name: 'Zain Ali', email: 'zain@gmail.com', phone: '03000000010', password: '$2b$10$zF1b.xlISR7TXjfFkIYLzuZuLB8iA0z0eWw4qT9KvBti7cYM5SSva', role: 'customer', isEmailVerified: true }
    ]);

    const vendors = users.filter(u => u.role === 'vendor');

    /* =======================
       CATEGORIES
    ======================= */
    const mainCategories = await Category.insertMany([
      { name: 'Electronics', parentCategory: null },
      { name: 'Fashion', parentCategory: null },
      { name: 'Home & Living', parentCategory: null },
      { name: 'Beauty & Personal Care', parentCategory: null },
      { name: 'Sports & Fitness', parentCategory: null }
    ]);

    const subCategories = await Category.insertMany([
      // Electronics
      { name: 'Smartphones', parentCategory: mainCategories[0]._id },
      { name: 'Laptops', parentCategory: mainCategories[0]._id },
      { name: 'Accessories', parentCategory: mainCategories[0]._id },

      // Fashion
      { name: 'Men Clothing', parentCategory: mainCategories[1]._id },
      { name: 'Women Clothing', parentCategory: mainCategories[1]._id },
      { name: 'Footwear', parentCategory: mainCategories[1]._id },

      // Home
      { name: 'Furniture', parentCategory: mainCategories[2]._id },
      { name: 'Kitchen', parentCategory: mainCategories[2]._id },
      { name: 'Decor', parentCategory: mainCategories[2]._id },

      // Beauty
      { name: 'Skincare', parentCategory: mainCategories[3]._id },
      { name: 'Hair Care', parentCategory: mainCategories[3]._id },
      { name: 'Makeup', parentCategory: mainCategories[3]._id },

      // Sports
      { name: 'Gym Equipment', parentCategory: mainCategories[4]._id },
      { name: 'Sportswear', parentCategory: mainCategories[4]._id },
      { name: 'Accessories', parentCategory: mainCategories[4]._id }
    ]);

    /* =======================
       SHOPS (9 TOTAL)
    ======================= */
    const shops = await Shop.insertMany([
      // Vendor 1 – Electronics
      { vendorId: vendors[0]._id, name: 'TechNova', email: 'technova@shops.com', phone: '0311111111', address: { city: 'Lahore', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[0]._id, name: 'GadgetHub', email: 'gadgethub@shops.com', phone: '0311111112', address: { city: 'Karachi', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[0]._id, name: 'Digital World', email: 'digital@shops.com', phone: '0311111113', address: { city: 'Islamabad', country: 'Pakistan' }, status: 'approved' },

      // Vendor 2 – Fashion
      { vendorId: vendors[1]._id, name: 'Urban Wear', email: 'urban@shops.com', phone: '0322222221', address: { city: 'Lahore', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[1]._id, name: 'Style Avenue', email: 'style@shops.com', phone: '0322222222', address: { city: 'Karachi', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[1]._id, name: 'Fashion Point', email: 'fashion@shops.com', phone: '0322222223', address: { city: 'Multan', country: 'Pakistan' }, status: 'approved' },

      // Vendor 3 – Home
      { vendorId: vendors[2]._id, name: 'Home Essentials', email: 'home@shops.com', phone: '0333333331', address: { city: 'Faisalabad', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[2]._id, name: 'Comfort Living', email: 'comfort@shops.com', phone: '0333333332', address: { city: 'Lahore', country: 'Pakistan' }, status: 'approved' },
      { vendorId: vendors[2]._id, name: 'Decor House', email: 'decor@shops.com', phone: '0333333333', address: { city: 'Karachi', country: 'Pakistan' }, status: 'approved' }
    ]);

    /* =======================
       PRODUCTS (36 TOTAL)
    ======================= */

    const products = [];
    let sku = 1000;

    // helper
    const cat = name => subCategories.find(c => c.name === name)._id;

    /* =======================
    VENDOR 1 – ELECTRONICS
    ======================= */

    // TechNova
    products.push(
    { shopId: shops[0]._id, vendorId: shops[0].vendorId, categoryId: cat('Smartphones'), name: 'Samsung Galaxy A54', slug: 'samsung-galaxy-a54', sku: `SKU-${sku++}`, description: '6.4" AMOLED, 50MP camera.', price: 120, stock: 40, status: 'active' },
    { shopId: shops[0]._id, vendorId: shops[0].vendorId, categoryId: cat('Smartphones'), name: 'Xiaomi Redmi Note 13', slug: 'xiaomi-redmi-note-13', sku: `SKU-${sku++}`, description: 'High value mid-range smartphone.', price: 220, stock: 60, status: 'active' },
    { shopId: shops[0]._id, vendorId: shops[0].vendorId, categoryId: cat('Accessories'), name: 'Anker 20000mAh Power Bank', slug: 'anker-20000mah-power-bank', sku: `SKU-${sku++}`, description: 'Fast charging power bank.', price: 200, stock: 50, status: 'active' },
    { shopId: shops[0]._id, vendorId: shops[0].vendorId, categoryId: cat('Accessories'), name: 'Baseus USB-C Fast Cable', slug: 'baseus-usb-c-cable', sku: `SKU-${sku++}`, description: 'Durable fast charging cable.', price: 150, stock: 100, status: 'active' }
    );

    // GadgetHub
    products.push(
    { shopId: shops[1]._id, vendorId: shops[1].vendorId, categoryId: cat('Laptops'), name: 'Dell Inspiron 15', slug: 'dell-inspiron-15', sku: `SKU-${sku++}`, description: 'Intel Core i5 laptop.', price: 180, stock: 0, status: 'active' },
    { shopId: shops[1]._id, vendorId: shops[1].vendorId, categoryId: cat('Laptops'), name: 'HP Pavilion 14', slug: 'hp-pavilion-14', sku: `SKU-${sku++}`, description: 'Slim & lightweight laptop.', price: 150, stock: 15, status: 'active' },
    { shopId: shops[1]._id, vendorId: shops[1].vendorId, categoryId: cat('Accessories'), name: 'Logitech Wireless Mouse', slug: 'logitech-wireless-mouse', sku: `SKU-${sku++}`, description: 'Ergonomic wireless mouse.', price: 30, stock: 80, status: 'active' },
    { shopId: shops[1]._id, vendorId: shops[1].vendorId, categoryId: cat('Accessories'), name: 'Laptop Cooling Pad', slug: 'laptop-cooling-pad', sku: `SKU-${sku++}`, description: 'USB powered cooling pad.', price: 50, stock: 40, status: 'active' }
    );

    // Digital World
    products.push(
    { shopId: shops[2]._id, vendorId: shops[2].vendorId, categoryId: cat('Smartphones'), name: 'Apple iPhone 13', slug: 'iphone-13', sku: `SKU-${sku++}`, description: 'A15 Bionic chip.', price: 280, stock: 18, status: 'active' },
    { shopId: shops[2]._id, vendorId: shops[2].vendorId, categoryId: cat('Accessories'), name: 'Apple MagSafe Charger', slug: 'apple-magsafe-charger', sku: `SKU-${sku++}`, description: 'Fast wireless charging.', price: 180, stock: 30, status: 'active' },
    { shopId: shops[2]._id, vendorId: shops[2].vendorId, categoryId: cat('Accessories'), name: 'Sony WH-1000XM4 Headphones', slug: 'sony-wh-1000xm4', sku: `SKU-${sku++}`, description: 'Noise cancelling headphones.', price: 200, stock: 12, status: 'active' },
    { shopId: shops[2]._id, vendorId: shops[2].vendorId, categoryId: cat('Accessories'), name: 'SanDisk 128GB USB Drive', slug: 'sandisk-128gb-usb', sku: `SKU-${sku++}`, description: 'USB 3.0 flash drive.', price: 40, stock: 90, status: 'active' }
    );

    /* =======================
    VENDOR 2 – FASHION
    ======================= */

    // Urban Wear
    products.push(
    { shopId: shops[3]._id, vendorId: shops[3].vendorId, categoryId: cat('Men Clothing'), name: 'Men Cotton Casual Shirt', slug: 'men-cotton-casual-shirt', sku: `SKU-${sku++}`, description: 'Breathable cotton shirt.', price: 40, stock: 0, status: 'active' },
    { shopId: shops[3]._id, vendorId: shops[3].vendorId, categoryId: cat('Men Clothing'), name: 'Slim Fit Denim Jeans', slug: 'slim-fit-denim-jeans', sku: `SKU-${sku++}`, description: 'Classic blue jeans.', price: 30, stock: 50, status: 'active' },
    { shopId: shops[3]._id, vendorId: shops[3].vendorId, categoryId: cat('Footwear'), name: 'Men Running Sneakers', slug: 'men-running-sneakers', sku: `SKU-${sku++}`, description: 'Comfortable sports shoes.', price: 60, stock: 40, status: 'active' },
    { shopId: shops[3]._id, vendorId: shops[3].vendorId, categoryId: cat('Footwear'), name: 'Leather Casual Loafers', slug: 'leather-casual-loafers', sku: `SKU-${sku++}`, description: 'Premium leather loafers.', price: 70, stock: 35, status: 'active' }
    );

    // Style Avenue
    products.push(
    { shopId: shops[4]._id, vendorId: shops[4].vendorId, categoryId: cat('Women Clothing'), name: 'Women Lawn Printed Suit', slug: 'women-lawn-printed-suit', sku: `SKU-${sku++}`, description: 'Summer lawn collection.', price: 20, stock: 80, status: 'active' }
    );

    // Fashion Point
    products.push(
    { shopId: shops[5]._id, vendorId: shops[5].vendorId, categoryId: cat('Men Clothing'), name: 'Men Formal Dress Shirt', slug: 'men-formal-dress-shirt', sku: `SKU-${sku++}`, description: 'Office wear cotton shirt.', price: 50, stock: 45, status: 'active' },
    { shopId: shops[5]._id, vendorId: shops[5].vendorId, categoryId: cat('Women Clothing'), name: 'Women Kurti Tunic', slug: 'women-kurti-tunic', sku: `SKU-${sku++}`, description: 'Comfortable casual kurti.', price: 25, stock: 55, status: 'active' },
    { shopId: shops[5]._id, vendorId: shops[5].vendorId, categoryId: cat('Footwear'), name: 'Men Leather Formal Shoes', slug: 'men-leather-formal-shoes', sku: `SKU-${sku++}`, description: 'Classic office shoes.', price: 100, stock: 25, status: 'active' },
    { shopId: shops[5]._id, vendorId: shops[5].vendorId, categoryId: cat('Footwear'), name: 'Women Khussa Shoes', slug: 'women-khussa-shoes', sku: `SKU-${sku++}`, description: 'Traditional handmade khussa.', price: 80, stock: 30, status: 'active' }
    );

    /* =======================
    VENDOR 3 – HOME & LIVING
    ======================= */

    // Home Essentials
    products.push(
    { shopId: shops[6]._id, vendorId: shops[6].vendorId, categoryId: cat('Kitchen'), name: 'Non-Stick Cookware Set', slug: 'non-stick-cookware-set', sku: `SKU-${sku++}`, description: '5-piece cookware set.', price: 150, stock: 35, status: 'active' },
    { shopId: shops[6]._id, vendorId: shops[6].vendorId, categoryId: cat('Kitchen'), name: 'Electric Kettle 1.7L', slug: 'electric-kettle-17l', sku: `SKU-${sku++}`, description: 'Fast boiling kettle.', price: 75, stock: 50, status: 'active' },
    { shopId: shops[6]._id, vendorId: shops[6].vendorId, categoryId: cat('Furniture'), name: 'Wooden Coffee Table', slug: 'wooden-coffee-table', sku: `SKU-${sku++}`, description: 'Solid wood coffee table.', price: 175, stock: 15, status: 'active' },
    { shopId: shops[6]._id, vendorId: shops[6].vendorId, categoryId: cat('Decor'), name: 'Decorative Wall Clock', slug: 'decorative-wall-clock', sku: `SKU-${sku++}`, description: 'Modern design wall clock.', price: 35, stock: 60, status: 'active' }
    );

    // Comfort Living
    products.push(
    { shopId: shops[7]._id, vendorId: shops[7].vendorId, categoryId: cat('Furniture'), name: '3-Seater Fabric Sofa', slug: '3-seater-fabric-sofa', sku: `SKU-${sku++}`, description: 'Comfortable living room sofa.', price: 450, stock: 8, status: 'active' },
    { shopId: shops[7]._id, vendorId: shops[7].vendorId, categoryId: cat('Furniture'), name: 'Queen Size Bed Frame', slug: 'queen-size-bed-frame', sku: `SKU-${sku++}`, description: 'Solid wood bed frame.', price: 320, stock: 0, status: 'active' },
    { shopId: shops[7]._id, vendorId: shops[7].vendorId, categoryId: cat('Decor'), name: 'Luxury Area Rug', slug: 'luxury-area-rug', sku: `SKU-${sku++}`, description: 'Soft premium rug.', price: 10, stock: 5, status: 'active' },
    { shopId: shops[7]._id, vendorId: shops[7].vendorId, categoryId: cat('Decor'), name: 'Table Lamp with Shade', slug: 'table-lamp-with-shade', sku: `SKU-${sku++}`, description: 'Modern bedside lamp.', price: 40, stock: 45, status: 'active' }
    );

    // Decor House
    products.push(
    { shopId: shops[8]._id, vendorId: shops[8].vendorId, categoryId: cat('Decor'), name: 'Wall Art Canvas Set', slug: 'wall-art-canvas-set', sku: `SKU-${sku++}`, description: '3-piece wall art.', price: 35, stock: 25, status: 'active' },
    { shopId: shops[8]._id, vendorId: shops[8].vendorId, categoryId: cat('Decor'), name: 'Artificial Indoor Plant', slug: 'artificial-indoor-plant', sku: `SKU-${sku++}`, description: 'Low maintenance decor plant.', price: 20, stock: 70, status: 'active' },
    { shopId: shops[8]._id, vendorId: shops[8].vendorId, categoryId: cat('Furniture'), name: 'Bookshelf Storage Unit', slug: 'bookshelf-storage-unit', sku: `SKU-${sku++}`, description: '5-tier wooden bookshelf.', price: 175, stock: 0, status: 'active' },
    { shopId: shops[8]._id, vendorId: shops[8].vendorId, categoryId: cat('Kitchen'), name: 'Dinnerware Set 24 Pieces', slug: 'dinnerware-set-24', sku: `SKU-${sku++}`, description: 'Complete dinner set.', price: 110, stock: 30, status: 'active' }
    );

    await Product.insertMany(products);


    /* =======================
       FINALIZE
    ======================= */
    res.clearCookie('token');
    req.flash('success', 'System reset successful.');
    res.redirect('/login');

  } catch (error) {
    console.error(error);
    next(error);
  }
});




export default router;
