import express from 'express';
const router = express.Router();
// import shopController from '../controllers/shopController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isVendor from '../middlewares/isVendor.js';
// import upload from '../middlewares/multer.js';
import isValid from '../middlewares/validation.js';

router.use(isLoggedIn);
router.use(isVendor);

router.get('/', (req, res)=> {
    res.render('vendor/dashboard', { title: 'Dashboard' });
});

// router.get('/shops', shopController.index);
// router.get('/shops/view/:id', shopController.view);
// router.get('/shops/create', shopController.create);
// router.post('/shops', isValid.shopValidation, shopController.store);
// router.get('/shops/edit/:id', shopController.edit);
// router.post('/shops/:id', isValid.shopUpdateValidation, shopController.update);
// router.delete('/shops/:id', shopController.destroy);
// router.get('/shops/trashed', shopController.trashed);
// router.post('/shops/restore/:id', shopController.restore);



export default router;
