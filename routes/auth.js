import express from 'express';
const router = express.Router();
// import userController from '../controllers/userController.js';
// import isLoggedIn from '../middlewares/isLoggedIn.js';
// import isAdmin from '../middlewares/isAdmin.js';
// import isValid from '../middlewares/validation.js';
// import redirectIfLoggedIn from '../middlewares/redirectIfLoggedIn.js';

// Login Routes
router.get('/', (req, res)=> {
    res.render('auth/login');
});

router.get('/login', (req, res)=> {
    res.render('auth/login');
});

router.get('/register', (req, res)=> {
    res.render('auth/register');
});

router.get('/forgot-password', (req, res)=> {
    res.render('auth/forgot-password');
});
// router.get('/', redirectIfLoggedIn, userController.loginPage);
// router.post('/index', isValid.loginValidation, userController.adminLogin);
// router.get('/logout', userController.logout);
// router.get('/dashboard', isLoggedIn, userController.dashboard);
// router.get('/settings', isLoggedIn, isAdmin, userController.settings);
// router.post('/settings/save', isLoggedIn, isAdmin, upload.single('logo'), userController.saveSettings);


// 404 Middleware
router.use('', (req, res, next) => {
    res.status(404).render('common/404',{
        message: 'Page Not Found'
    });
});


// Error Handling Middleware
// router.use(isLoggedIn,(err, req, res, next) => {
//     console.log(err.stack);
//     const status = err.status || 500;
//     res.status(status).render('admin/error',{
//         status: status,
//         message: err.message || 'Something went wrong!',
//         role: req.role
//     });
// });

export default router;
