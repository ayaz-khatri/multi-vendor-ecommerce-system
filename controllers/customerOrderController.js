import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import VendorOrder from "../models/VendorOrder.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";
import { generateOrderNumber } from "../utils/helper.js";

const placeOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            req.flash("error", "Invalid checkout details.");
            return res.redirect("/cart/checkout");
        }

        // Fetch cart
        const cart = await Cart.findOne({ userId, isDeleted: false }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            req.flash("error", "Your cart is empty.");
            return res.redirect("/cart/checkout");
        }

        // Validate stock and prepare order items
        const vendorMap = {}; // { vendorId: [itemData, ...] }
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;

            if (!product || product.isDeleted) {
                req.flash("error", "One or more products are unavailable.");
                return res.redirect("/cart/checkout");
            }

            if (product.stock < item.quantity) {
                req.flash("error", `Insufficient stock for ${product.name}`);
                return res.redirect("/cart/checkout");
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            const itemData = {
                productId: product._id,
                shopId: product.shopId, // keep shop info per item
                vendorId: product.vendorId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: product.price * item.quantity,
                status: "pending" // optional for future
            };

            orderItems.push(itemData);

            const vendorIdStr = product.vendorId.toString();
            if (!vendorMap[vendorIdStr]) vendorMap[vendorIdStr] = [];
            vendorMap[vendorIdStr].push(itemData);
        }

        // Calculate totals for parent Order
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        // Create parent order
        const order = new Order({
            userId,
            orderNumber: generateOrderNumber(),
            totalQuantity,
            totalPrice,
            shippingAddress,
            paymentMethod,
            paymentStatus: "pending",
            overallStatus: "pending"
        });

        await order.save();

        // Create VendorOrders per vendor
        const commissionRate = 0;

        for (const vendorId of Object.keys(vendorMap)) {
            const items = vendorMap[vendorId];
            const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

            const commission = subtotal * commissionRate;
            const vendorEarning = subtotal - commission;

            const vendorOrder = new VendorOrder({
                orderId: order._id,
                vendorId,
                items,
                subtotal,
                vendorStatus: "pending",
                commission,
                vendorEarning
            });

            await vendorOrder.save();
        }

        // Clear cart
        cart.items = [];
        cart.totalQuantity = 0;
        cart.totalPrice = 0;
        await cart.save();

        req.flash("success", "Order placed successfully.");
        return res.redirect(`/orders/${order._id}`);

    } catch (error) {
        console.error("Place order error:", error);
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
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) return next(errorMessage('Order not found.', 404));
        res.render('frontend/order', { order, title: "Order Details" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const cancel = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order || order.orderStatus !== "pending") return next(errorMessage('Order not found.', 404));
        order.orderStatus = "cancelled";
        await order.save();
        req.flash("success", "Order cancelled successfully.");
        res.redirect(`/orders/${order._id}`);
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const confirmDelivery = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order || order.orderStatus !== "shipped") return next(errorMessage('Order not found.', 404));
        if(order.orderStatus === "delivered") return next(errorMessage('Order already delivered.', 404));
        order.orderStatus = "delivered";
        await order.save();
        req.flash("success", "Order delivered successfully.");
        res.redirect(`/orders/${order._id}`);
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

export default {
    placeOrder,
    orders,
    order,
    cancel,
    confirmDelivery
}