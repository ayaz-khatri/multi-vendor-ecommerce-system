import express from 'express';
const router = express.Router();
import shopController from '../controllers/shopController.js';
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

router.get('/shops', shopController.index);
router.get('/shops/view/:id', shopController.view);
router.get('/shops/create', shopController.create);
router.post('/shops', uploadShopImage.fields([{ name: 'logo', maxCount: 1 },{ name: 'banner', maxCount: 1 }]), isValid.shopValidation, shopController.store);
router.get('/shops/edit/:id', shopController.edit);
router.post('/shops/:id', uploadShopImage.fields([{ name: 'logo', maxCount: 1 },{ name: 'banner', maxCount: 1 }]), isValid.shopValidation, shopController.update);
router.delete('/shops/:id', shopController.destroy);
router.get('/shops/trashed', shopController.trashed);
router.post('/shops/restore/:id', shopController.restore);



export default router;
