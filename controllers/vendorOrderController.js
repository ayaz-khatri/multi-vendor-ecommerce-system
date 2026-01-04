import VendorOrder from "../models/VendorOrder.js";
import Order from "../models/Order.js";
import errorMessage from "../utils/error-message.js";
import { timeAgo } from "../utils/helper.js";
import { syncOverallOrderStatus } from '../services/orderSyncService.js';

const index = async (req, res, next) => {
    try {
        const vendorId = req.user.id;

        const vendorOrders = await VendorOrder.find({ vendorId, vendorStatus: { $ne: 'cancelled' } })
                                                .populate("orderId", "orderNumber paymentMethod paymentStatus overallStatus createdAt")
                                                .sort({ createdAt: -1 });
        res.render("vendor/orders/index", { orders: vendorOrders, timeAgo, title: "Orders" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const view = async (req, res, next) => {
    try {
        const vendorOrder = await VendorOrder.findOne({ _id: req.params.id, vendorId: req.user.id })
                                                .populate("orderId")
                                                .populate("items.productId")
                                                .populate("items.shopId");
        if (!vendorOrder) { return next(errorMessage("Order not found", 404)); }

        // Group items by shop
        const itemsByShop = {};
        vendorOrder.items.forEach(item => {
            const shopId = item.shopId._id.toString();
            if (!itemsByShop[shopId]) {
                itemsByShop[shopId] = {
                    shop: item.shopId,
                    items: [],
                    subtotal: 0
                };
            }
            itemsByShop[shopId].items.push(item);
            itemsByShop[shopId].subtotal += item.subtotal;
        });
        res.render("vendor/orders/view", { order: vendorOrder, itemsByShop: Object.values(itemsByShop), title: "Order Details" });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};


const updateStatus = async (req, res, next) => {
    try {
        const { vendorStatus } = req.body;
        const vendorOrder = await VendorOrder.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!vendorOrder) return next(errorMessage('Order not found', 404));

        // Prevent invalid updates
        if (['cancelled', 'delivered'].includes(vendorOrder.vendorStatus)) {
            req.flash('error', 'Order status can no longer be changed.');
            return res.redirect('/vendor/orders/view/' + req.params.id);
        }

        const allowedTransitions = {
            pending: ['accepted', 'cancelled'],
            accepted: ['shipped', 'cancelled'],
            shipped: ['delivered'],
        };

        if ( !allowedTransitions[vendorOrder.vendorStatus]?.includes(vendorStatus) ) {
            req.flash('error', 'Invalid status change.');
            return res.redirect('/vendor/orders/view/' + req.params.id);
        }

        vendorOrder.vendorStatus = vendorStatus;
        await vendorOrder.save();

        // 🔁 Sync main order status
        await syncOverallOrderStatus(vendorOrder.orderId);

        req.flash('success', 'Order status updated successfully.');
        res.redirect('/vendor/orders/view/' + req.params.id);
    } catch (error) {
        next(errorMessage('Something went wrong', 500));
    }
};


export default {
    index,
    view,
    updateStatus
}