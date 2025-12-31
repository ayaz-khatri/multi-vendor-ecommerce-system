import express from 'express';
const router = express.Router();
import loadCategories from '../middlewares/loadCategories.js';
import shareQueryParams from '../middlewares/shareQueryParams.js';
import wishlistController from '../controllers/wishlistController.js';
import frontendController from '../controllers/frontendController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';


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

/* --------------------------------- Wislist -------------------------------- */
router.post('/wishlist/add', isLoggedIn, wishlistController.add);
router.delete('/wishlist/remove/:id', isLoggedIn, wishlistController.remove);
router.get('/wishlist/', isLoggedIn, wishlistController.index);
router.get('/wishlist/check/:id', isLoggedIn, wishlistController.check);
// router.delete('/wishlist/clear', isLoggedIn, wishlistController.clearWishlist); // optional

export default router;
