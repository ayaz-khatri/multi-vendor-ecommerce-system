import Cart from "../models/Cart.js";

const cart = async (req, res, next) => {
    try {
        res.locals.cart = null;
        res.locals.cartItems = [];
        res.locals.cartProductIds = [];
        res.locals.cartTotalQuantity = 0;
        res.locals.cartTotalPrice = 0;

        if (!req.user) {
            return next();
        }

        const cart = await Cart.findOne({
            userId: req.user.id,
            isDeleted: false
        }).populate("items.productId");

        if (!cart) {
            return next();
        }

        res.locals.cart = cart;
        res.locals.cartItems = cart.items;
        res.locals.cartProductIds = cart.items.map(
            item => item.productId._id.toString()
        );
        res.locals.cartTotalQuantity = cart.totalQuantity;
        res.locals.cartTotalPrice = cart.totalPrice;

        next();

    } catch (error) {
        next(error);
    }
};

export default cart;
