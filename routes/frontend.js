import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import frontendController from '../controllers/frontendController.js';

router.use(loadCategories);

router.get("/", frontendController.index);
router.get("/product/:slug", frontendController.product);

export default router;
