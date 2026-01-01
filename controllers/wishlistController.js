import Wishlist from "../models/Wishlist.js";
import errorMessage from "../utils/error-message.js";

const index = async (req, res, next) => {
    try{
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ userId })
                                .populate('items.productId')
                                .populate('items.shopId', ['name', 'slug'])
                                .populate('items.vendorId', 'name');
                                // res.send(wishlist);
        res.render('frontend/wishlist', { wishlist, title: 'Wishlist' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const toggle = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, shopId, vendorId, action } = req.body;

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) wishlist = new Wishlist({ userId, items: [] });
        let message = "";
        if (action === 'add') {
            const exists = wishlist.items.some(
                i => i.productId.toString() === productId
            );

            if (!exists) {
                wishlist.items.push({ productId, shopId, vendorId });
                message = "Product added to wishlist";
            } else {
                message = "Already in wishlist";
            }

        }

        if (action === 'remove') {
            wishlist.items = wishlist.items.filter(
                i => i.productId.toString() !== productId
            );
            message = "Product removed from wishlist";
        }

        await wishlist.save();
        req.flash("success", message);
        const redirectTo = req.get('Referer') || '/products';
        return res.redirect(redirectTo);

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    toggle
};