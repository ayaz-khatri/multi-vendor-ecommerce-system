import Wishlist from "../models/Wishlist.js";
import errorMessage from "../utils/error-message.js";

const index = async (req, res, next) => {
    try{
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ userId })
                                .populate('items.productId')
                                .populate('items.shopId', ['name', 'slug'])
                                .populate('items.vendorId', 'name');
        res.render('frontend/wishlist', { wishlist: wishlist.items, title: 'Wishlist' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const add = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, shopId, vendorId } = req.body;

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, items: [] });
        }

        const exists = wishlist.items.some(
            item => item.productId.toString() === productId
        );

        if (exists) {
            return res.json({ success: false, message: 'Already in wishlist' });
        }

        wishlist.items.push({ productId, shopId, vendorId });
        await wishlist.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const remove = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        await Wishlist.updateOne(
            { userId },
            { $pull: { items: { productId } } }
        );

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const check = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            userId,
            "items.productId": productId
        });

        res.json({ isWishlisted: !!wishlist });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    add,
    remove,
    index,
    check
};