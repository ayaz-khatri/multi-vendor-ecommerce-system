import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import shareQueryParams from '../middlewares/shareQueryParams.js';
import wishlistController from '../controllers/wishlistController.js';
import frontendController from '../controllers/frontendController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import wishlist from '../middlewares/wishlist.js';
import isCustomer from '../middlewares/isCustomer.js';


router.use(loadCategories);
router.use(shareQueryParams);

router.get("/", wishlist, frontendController.index);
router.get("/products", wishlist, frontendController.products);
router.get("/products/:slug", wishlist, frontendController.product);

router.get("/categories/*slug", frontendController.categoryRedirect);

router.get("/shops", wishlist, frontendController.shops);
router.get("/shops/:slug", frontendController.shopRedirect);

router.get("/vendors", wishlist, frontendController.vendors);
router.get("/vendors/:slug", frontendController.vendorRedirect);

/* --------------------------------- Wislist -------------------------------- */
router.post('/wishlist/toggle', isLoggedIn, isCustomer, wishlistController.toggle);
router.get('/wishlist/', isLoggedIn, wishlist, isCustomer, wishlistController.index);

export default router;
