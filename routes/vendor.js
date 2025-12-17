import express from 'express';
const router = express.Router();
// import shopController from '../controllers/shopController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isVendor from '../middlewares/isVendor.js';
// import upload from '../middlewares/multer.js';
import isValid from '../middlewares/validation.js';

router.use(isLoggedIn);
router.use(isVendor);
// User CRUD Routes
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


// router.get('/users', isLoggedIn, isAdmin, userController.allUsers);
// router.get('/users/add', isLoggedIn, isAdmin, userController.addUserPage);
// router.post('/users/add', isLoggedIn, isAdmin, isValid.userValidation, userController.addUser);
// router.get('/users/update/:id', isLoggedIn, isAdmin, userController.updateUserPage);
// router.post('/users/update/:id', isLoggedIn, isAdmin, isValid.userUpdateValidation, userController.updateUser);
// router.delete('/users/delete/:id', isLoggedIn, isAdmin, userController.deleteUser);


// 404 Middleware
router.use('', (req, res, next) => {
    res.status(404).render('common/404',{
        message: 'Page Not Found'
    });
});


// Error Handling Middleware
router.use('',(err, req, res, next) => {
    console.log(err.stack);
    const status = err.status || 500;
    res.status(status).render('common/error',{
        status: status,
        message: err.message || 'Something went wrong!'
    });
});

export default router;
