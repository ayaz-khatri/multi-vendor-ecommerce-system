import express from 'express';
const router = express.Router();
import vendorShopController from '../controllers/vendorShopController.js';
import vendorProductController from '../controllers/vendorProductController.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
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
        const shops = await Shop.find({ isDeleted: false, vendorId: req.user.id });
        const products = await Product.find({ isDeleted: false, vendorId: req.user.id });

        res.render('vendor/dashboard', { shopCount: shops.length, productCount: products.length, title: 'Dashboard' });
    } catch (error) {
            next(errorMessage("Something went wrong", 500));
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


export default router;
