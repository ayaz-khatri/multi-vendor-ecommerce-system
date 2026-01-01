import Wishlist from '../models/Wishlist.js';

const wishlist = async (req, res, next) => {
    try {
        res.locals.wishlistIds = [];
        res.locals.wishlistCount = 0;

        if (req.user) {
            const wishlist = await Wishlist.findOne(
                { userId: req.user.id },
                { items: 1 } // projection (performance)
            );

            if (wishlist && wishlist.items.length > 0) {
                res.locals.wishlistIds = wishlist.items.map(
                    i => i.productId.toString()
                );
                res.locals.wishlistCount = wishlist.items.length;
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default wishlist;
