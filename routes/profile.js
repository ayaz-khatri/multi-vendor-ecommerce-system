import express from 'express';
const router = express.Router();
import profileController from '../controllers/profileController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import isValid from '../middlewares/validation.js';
import createUploader from '../middlewares/multer.js';
const uploadprofilePic = createUploader('users');

router.use(isLoggedIn);

router.get("/edit/:id", profileController.edit);
router.post("/edit/:id", uploadprofilePic.single('profilePic'), isValid.profileValidation, profileController.update);

router.get("/password/:id", profileController.passwordForm);
router.post("/password/:id", isValid.passwordUpdateValidation, profileController.passwordUpdate);

export default router;
