import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import shareQueryParams from '../middlewares/shareQueryParams.js';
import wishlistController from '../controllers/wishlistController.js';
import cartController from '../controllers/cartController.js';
import frontendController from '../controllers/frontendController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';
import wishlist from '../middlewares/wishlist.js';
import cart from '../middlewares/cart.js';
import isCustomer from '../middlewares/isCustomer.js';


router.use(loadCategories);
router.use(shareQueryParams);

router.get("/", wishlist, cart, frontendController.index);
router.get("/products", wishlist, cart, frontendController.products);
router.get("/products/:slug", wishlist, cart, frontendController.product);

router.get("/categories/*slug", frontendController.categoryRedirect);

router.get("/shops", wishlist, cart, frontendController.shops);
router.get("/shops/:slug", frontendController.shopRedirect);

router.get("/vendors", wishlist, cart, frontendController.vendors);
router.get("/vendors/:slug", frontendController.vendorRedirect);

/* --------------------------------- Wislist -------------------------------- */
router.post('/wishlist/toggle', isLoggedIn, isCustomer, wishlistController.toggle);
router.get('/wishlist/', isLoggedIn, isCustomer, wishlist, cart, wishlistController.index);

/* ---------------------------------- Cart ---------------------------------- */
router.post('/cart/toggle', isLoggedIn, isCustomer, wishlist, cartController.toggle);
router.get('/cart/', isLoggedIn, isCustomer, wishlist, cart, cartController.index);
router.post("/cart/update", isLoggedIn, isCustomer, wishlist, cartController.update);
router.get("/cart/clear", isLoggedIn, isCustomer, cartController.clear);

export default router;
