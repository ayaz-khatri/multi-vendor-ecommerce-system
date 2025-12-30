import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import shareQueryParams from '../middlewares/shareQueryParams.js';
import frontendController from '../controllers/frontendController.js';

router.use(loadCategories);
router.use(shareQueryParams);

router.get("/", frontendController.index);
router.get("/products", frontendController.products);
router.get("/products/:slug", frontendController.product);

router.get("/categories/*slug", frontendController.categoryRedirect);


router.get("/shops", frontendController.shops);
router.get("/shops/:slug", frontendController.shopRedirect);

router.get("/vendors", frontendController.vendors);
router.get("/vendors/:slug", frontendController.vendorRedirect);

export default router;
