import express from 'express';
const router = express.Router();
import vendorShopController from '../controllers/vendorShopController.js';
import vendorProductController from '../controllers/vendorProductController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isVendor from '../middlewares/isVendor.js';
import isValid from '../middlewares/validation.js';
import createUploader from '../middlewares/multer.js';
const uploadShopImage = createUploader('shops');

router.use(isLoggedIn);
router.use(isVendor);

router.get('/', (req, res)=> {
    res.render('vendor/dashboard', { title: 'Dashboard' });
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
router.post('/products', isValid.productValidation, vendorProductController.store);
router.get('/products/edit/:id', vendorProductController.edit);
router.post('/products/:id', isValid.productValidation, vendorProductController.update);
router.delete('/products/:id', vendorProductController.destroy);
router.get('/products/trashed', vendorProductController.trashed);
router.post('/products/restore/:id', vendorProductController.restore);


export default router;
