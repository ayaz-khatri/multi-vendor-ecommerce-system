import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
// import userController from '../controllers/userController.js';
import redirectIfLoggedIn from '../middlewares/redirectIfLoggedIn.js';
import isValid from '../middlewares/validation.js';

// router.use(redirectIfLoggedIn);

// Login Routes
router.get('/login', redirectIfLoggedIn, authController.loginPage);
router.post('/login', redirectIfLoggedIn, isValid.loginValidation, authController.login);

router.get('/register', redirectIfLoggedIn, authController.registerPage);
router.post('/register', redirectIfLoggedIn, isValid.userValidation, authController.register);

router.get('/forgot-password', redirectIfLoggedIn, authController.forgotPasswordPage);
router.post('/forgot-password', redirectIfLoggedIn, authController.forgotPassword);

router.get('/logout', authController.logout);

router.get('/verify-email/:token', authController.verifyEmail);

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
router.use('',(err, req, res, next) => {
    console.log(err.stack);
    const status = err.status || 500;
    res.status(status).render('common/error',{
        status: status,
        message: err.message || 'Something went wrong!',
        role: req.role
    });
});

export default router;
