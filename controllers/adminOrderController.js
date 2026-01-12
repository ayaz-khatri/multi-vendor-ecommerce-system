import Order from "../models/Order.js";
import VendorOrder from "../models/VendorOrder.js";
import Product from "../models/Product.js";
import errorMessage from "../utils/error-message.js";
import { timeAgo } from "../utils/helper.js";
import { syncOverallOrderStatus } from '../services/orderSyncService.js';

const index = async (req, res, next) => {
    try {
        const orders = await Order.find({ isDeleted: false }).populate("userId", "name email profilePic").sort({ createdAt: -1 });
        res.render("admin/orders/index", { orders, timeAgo, title: "Orders" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("userId", "name email profilePic");
        if (!order) { return next(errorMessage("Order not found", 404)); }

        const vendorOrders = await VendorOrder.find({ orderId: order._id })
                                                .populate("vendorId", "name email")
                                                .populate("items.productId", "name")
                                                .populate("items.shopId", "name");
        res.render("admin/orders/view", { order, vendorOrders, title: `Order #${order.orderNumber}` });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const cancel = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) { return next(errorMessage("Order not found", 404)); }

        // Block if order already completed
        if (order.overallStatus === 'completed') {
            req.flash("error", "Completed orders cannot be cancelled.");
            res.redirect(`/admin/orders/view/${id}`);
        }

        // Find vendor orders that can be cancelled
        const vendorOrders = await VendorOrder.find({ orderId: id, vendorStatus: { $in: ['pending', 'accepted'] } });

        // Cancel vendor orders + restore stock
        for (const vo of vendorOrders) {

            // Restore stock per item
            for (const item of vo.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            // Cancel vendor order
            vo.vendorStatus = 'cancelled';
            await vo.save();
        }

        // Sync overall order status
        await syncOverallOrderStatus(id);

        req.flash("success", "Order cancelled successfully.");
        res.redirect(`/admin/orders/view/${id}`);

    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


export default {
    index,
    view,
    cancel
};
