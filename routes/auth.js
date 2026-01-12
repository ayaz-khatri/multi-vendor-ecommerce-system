import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import redirectIfLoggedIn from '../middlewares/redirectIfLoggedIn.js';
import isValid from '../middlewares/validation.js';

router.use(authController.authLayout);

// Login Routes
router.get('/login', redirectIfLoggedIn, authController.loginPage);
router.post('/login', redirectIfLoggedIn, isValid.loginValidation, authController.login);

router.get('/register', redirectIfLoggedIn, authController.registerPage);
router.post('/register', redirectIfLoggedIn, isValid.userValidation, authController.register);

router.get('/forgot-password', redirectIfLoggedIn, authController.forgotPasswordPage);
router.post('/forgot-password', redirectIfLoggedIn, isValid.forgotPasswordValidation, authController.forgotPassword);

router.get('/reset-password/:token', authController.resetPasswordPage);
router.post('/reset-password/:token', isValid.resetPasswordValidation, authController.resetPassword);

router.get('/logout', authController.logout);

router.get('/verify-email/:token', authController.verifyEmail);

export default router;
