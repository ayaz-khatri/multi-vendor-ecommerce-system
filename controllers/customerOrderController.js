import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";
import { generateOrderNumber } from "../utils/helper.js";

const placeOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            throw errorMessage("Invalid checkout data", 400);
        }

        const cart = await Cart.findOne({
            userId,
            isDeleted: false
        }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            throw errorMessage("Your cart is empty", 400);
        }

        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;

            if (!product || product.isDeleted) {
                throw errorMessage("One or more products are unavailable", 400);
            }

            if (product.stock < item.quantity) {
                throw errorMessage(`Insufficient stock for ${product.name}`, 400);
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();
            
            orderItems.push({
                productId: product._id,
                shopId: product.shopId,
                vendorId: product.vendorId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: product.price * item.quantity
            });
        }

        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        const order = new Order({
            userId,
            orderNumber: generateOrderNumber(),
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalQuantity,
            totalPrice,
            orderStatus: "pending",
            paymentStatus: "pending"
        });

        await order.save();

        // Clear cart
        cart.items = [];
        cart.totalQuantity = 0;
        cart.totalPrice = 0;
        await cart.save();

        req.flash("success", "Order placed successfully.");
        res.redirect(`/orders/view/${order._id}`);

    } catch (error) {
        console.error(error);
        next(error);
    }
};


const orders = async (req, res, next) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.render('frontend/orders', { orders, title: "My Orders" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const order = async (req, res, next) => {
    try {

        req.flash("success", "Order placed successfully.");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};

const cancel = async (req, res, next) => {
    try {
        req.flash("success", "Order placed successfully.");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};

const confirm = async (req, res, next) => {
    try {
        req.flash("success", "Order placed successfully.");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        next(errorMessage("Something went wrong", 500));
    }
};

export default {
    placeOrder,
    orders,
    order,
    cancel,
    confirm
}