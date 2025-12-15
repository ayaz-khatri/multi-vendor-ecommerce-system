import express from 'express';
const router = express.Router();
import vendorController from '../controllers/vendorController.js';
// import userController from '../controllers/userController.js';
// import isLoggedIn from '../middlewares/isLoggedIn.js';
// import isAdmin from '../middlewares/isAdmin.js';
// import upload from '../middlewares/multer.js';
import isValid from '../middlewares/validation.js';

// User CRUD Routes
router.get('/', (req, res)=> {
    res.render('admin/dashboard', { title: 'Dashboard' });
});

router.get('/vendors', vendorController.index);        // list vendors
router.get('/vendors/create', vendorController.create); // form
router.post('/vendors', isValid.vendorValidation, vendorController.store);       // save new vendor
router.get('/vendors/edit/:id', vendorController.edit);// edit form
router.post('/vendors/:id', isValid.vendorUpdateValidation, vendorController.update);   // update vendor
router.delete('/vendors/:id', vendorController.destroy);// delete vendor


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
