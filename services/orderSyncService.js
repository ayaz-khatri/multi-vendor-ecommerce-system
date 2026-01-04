import Order from '../models/Order.js';
import VendorOrder from '../models/VendorOrder.js';

export const syncOverallOrderStatus = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) return;

    const vendorOrders = await VendorOrder.find({ orderId });

    const activeVendorOrders = vendorOrders.filter(
        vo => vo.vendorStatus !== 'cancelled'
    );

    // 1️⃣ All vendors cancelled
    if (activeVendorOrders.length === 0) {
        order.overallStatus = 'cancelled';

        if (order.paymentMethod !== 'cod' && order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();
        return;
    }

    // 2️⃣ All ACTIVE vendors delivered
    const allDelivered = activeVendorOrders.every(
        vo => vo.vendorStatus === 'delivered'
    );

    if (allDelivered) {
        order.overallStatus = 'completed';

        if (order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        }

        await order.save();

        // 💰 PAY EACH DELIVERED VENDOR
        for (const vo of activeVendorOrders) {
            if (vo.vendorEarningStatus === 'pending') {
                vo.vendorEarning = vo.subtotal - vo.commission;
                vo.vendorEarningStatus = 'paid';
                await vo.save();
            }
        }

        return;
    }

    // 3️⃣ Some vendors delivered
    if (activeVendorOrders.some(vo => vo.vendorStatus === 'delivered')) {
        order.overallStatus = 'partially_completed';
        await order.save();
        return;
    }

    // 4️⃣ Default
    order.overallStatus = 'pending';
    await order.save();
};