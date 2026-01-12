import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import vendorShopController from '../controllers/vendorShopController.js';
import vendorProductController from '../controllers/vendorProductController.js';
import vendorOrderController from '../controllers/vendorOrderController.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import VendorOrder from '../models/VendorOrder.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isVendor from '../middlewares/isVendor.js';
import errorMessage from "../utils/error-message.js";
import isValid from '../middlewares/validation.js';
import createUploader from '../middlewares/multer.js';
const uploadShopImage = createUploader('shops');
const uploadProductImages = createUploader('products');

router.use(isLoggedIn);
router.use(isVendor);

router.get('/', async (req, res, next) => {
    try {
        const vendorId = new mongoose.Types.ObjectId(req.user.id);

        const [shopCount, productCount, stats] = await Promise.all([
            Shop.countDocuments({ isDeleted: false, vendorId }),
            Product.countDocuments({ isDeleted: false, vendorId }),

            VendorOrder.aggregate([
                {
                    $match: { vendorId }
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'orderId',
                        foreignField: '_id',
                        as: 'order'
                    }
                },
                { $unwind: '$order' },

                {
                    $group: {
                        _id: null,

                        totalOrders: {
                            $sum: {
                                $cond: [{ $ne: ['$vendorStatus', 'cancelled'] }, 1, 0]
                            }
                        },

                        cancelledOrders: {
                            $sum: {
                                $cond: [{ $eq: ['$vendorStatus', 'cancelled'] }, 1, 0]
                            }
                        },

                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$vendorStatus', 'delivered'] },
                                    '$vendorEarning',
                                    0
                                ]
                            }
                        },

                        pendingEarning: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$vendorStatus', 'delivered'] },
                                            { $eq: ['$vendorEarningStatus', 'pending'] }
                                        ]
                                    },
                                    '$vendorEarning',
                                    0
                                ]
                            }
                        },

                        customers: { $addToSet: '$order.userId' }
                    }
                },
                {
                    $project: {
                        totalOrders: 1,
                        cancelledOrders: 1,
                        totalRevenue: 1,
                        pendingEarning: 1,
                        totalCustomers: { $size: '$customers' }
                    }
                }
            ])
        ]);

        const dashboardStats = stats[0] || {
            totalOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0,
            pendingEarning: 0,
            totalCustomers: 0
        };

        res.render('vendor/dashboard', {
            title: 'Dashboard',
            shopCount,
            productCount,
            totalOrders: dashboardStats.totalOrders,
            cancelledOrders: dashboardStats.cancelledOrders,
            totalRevenue: dashboardStats.totalRevenue,
            pendingEarning: dashboardStats.pendingEarning,
            totalCustomers: dashboardStats.totalCustomers
        });

    } catch (error) {
        console.error(error);
        next(errorMessage('Something went wrong', 500));
    }
});


// Shop Routes
router.get('/shops', vendorShopController.index);
router.get('/shops/view/:id', vendorShopController.view);
router.get('/shops/create', vendorShopController.create);
router.post('/shops', uploadShopImage.fields([{ name: 'logo', maxCount: 1 },{ name: 'banner', maxCount: 1 }]), isValid.shopValidation, vendorShopController.store);
router.get('/shops/edit/:id', vendorShopController.edit);
router.post('/shops/:id', uploadShopImage.fields([{ name: 'logo', maxCount: 1 },{ name: 'banner', maxCount: 1 }]), isValid.shopValidation, vendorShopController.update);
router.delete('/shops/:id', vendorShopController.destroy);
router.get('/shops/trashed', vendorShopController.trashed);
router.post('/shops/restore/:id', vendorShopController.restore);

// Product Routes
router.get('/products', vendorProductController.index);
router.get('/products/view/:id', vendorProductController.view);
router.get('/products/create', vendorProductController.create);
router.post('/products', uploadProductImages.array('images[]', 10), isValid.productValidation, vendorProductController.store);
router.get('/products/edit/:id', vendorProductController.edit);
router.post('/products/:id', uploadProductImages.array('images[]', 10), isValid.productValidation, vendorProductController.update);
router.delete('/products/:id', vendorProductController.destroy);
router.get('/products/trashed', vendorProductController.trashed);
router.post('/products/restore/:id', vendorProductController.restore);

// Order Routes
router.get('/orders', vendorOrderController.index);
router.get('/orders/view/:id', vendorOrderController.view);
router.post('/orders/status/:id', vendorOrderController.updateStatus);


export default router;
