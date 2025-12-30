import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import shareQueryParams from '../middlewares/shareQueryParams.js';
import frontendController from '../controllers/frontendController.js';

router.use(loadCategories);
router.use(shareQueryParams);

router.get("/", frontendController.index);
router.get("/products", frontendController.products);
router.get("/product/:slug", frontendController.product);
router.get("/category/*slug", frontendController.categoryRedirect);
router.get("/shop/:slug", frontendController.shopRedirect);
router.get("/vendor/:slug", frontendController.vendorRedirect);

export default router;
