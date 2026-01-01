import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";

const index = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        cart.shipping = 0;
        if(cart && cart.items && cart.items.length > 0){
            cart.shipping = 10;
        }
        res.render("frontend/cart", { cart, title: "Cart"});
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const toggle = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, action } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return next(errorMessage("Product not found", 404));
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            i => i.productId.toString() === productId
        );

        let message = "";

        if (action === "add") {

            if (itemIndex > -1) {
                // Increase quantity
                cart.items[itemIndex].quantity += 1;
                cart.items[itemIndex].subtotal =
                    cart.items[itemIndex].quantity * cart.items[itemIndex].price;

                message = "Cart quantity updated";

            } else {
                cart.items.push({
                    productId: product._id,
                    shopId: product.shopId,
                    vendorId: product.vendorId,
                    quantity: 1,
                    price: product.price,
                    subtotal: product.price
                });

                message = "Product added to cart";
            }
        }

        if (action === "remove") {
            cart.items = cart.items.filter(
                i => i.productId.toString() !== productId
            );

            message = "Product removed from cart";
        }

        await cart.save();

        req.flash("success", message);
        return res.redirect(req.get("Referer") || "/products");

    } catch (error) {
        console.log(error)
        next(errorMessage("Something went wrong", 500));
    }
};

const update = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            req.flash("error", "Invalid Quantity.");
            return res.redirect("/cart");
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            req.flash("error", "Cart not found.");
            return res.redirect("/cart");
        }

        const item = cart.items.find(
            i => i.productId.toString() === productId
        );

        if (!item) {
            req.flash("error", "Item not in cart.");
            return res.redirect("/cart");
        }

        const product = await Product.findOne({ _id: item.productId });
        if (!product || product.isDeleted || product.stock < quantity) {
            req.flash("error", "Item is out of stock.");
            return res.redirect("/cart");
        }

        item.quantity = quantity;
        item.subtotal = item.quantity * item.price;

        await cart.save();

        req.flash("success", "Cart updated.");
        return res.redirect("/cart");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const clear = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            req.flash("error", "Cart not found.");
            return res.redirect("/cart");
        }
        cart.items = [];

        await cart.save();

        req.flash("success", "Cart items removed successfully.");
        return res.redirect("/cart");

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    toggle,
    update,
    clear
};
