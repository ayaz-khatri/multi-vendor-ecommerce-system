// import Order from "../models/Order.js";
// import Shop from "../models/Shop.js";
// import errorMessage from "../utils/error-message.js";
// import { timeAgo } from '../utils/helper.js';

// const index = async (req, res, next) => {
//     try {
//         const vendorId = req.user.id;
//         const orders = await Order.find({ 'items.vendorId': vendorId, isDeleted: false }).sort({ createdAt: -1 });
//         const vendorOrders = orders.map(order => ({
//             ...order.toObject(),
//             items: order.items.filter(
//                 item => item.vendorId.toString() === vendorId
//             )
//         }));
//         res.render('vendor/orders', { orders: vendorOrders, title: 'Orders' });
//     } catch (error) {
//         console.error(error);
//         next(errorMessage("Something went wrong", 500));
//     }
// };


// const view = async (req, res, next) => {
//     try {
//         const order = await Order.findOne({ _id: req.params.id, vendorId: req.user.id });
//         if (!order) return next(errorMessage('Order not found.', 404));
//         res.render('vendor/orders/view', { order, title: "Order Details" });
//     } catch (error) {
//         next(errorMessage("Something went wrong", 500));
//     }
// };

// const confirmItem = async (req, res, next) => {
//     try {
//         const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
//         if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
//         res.render('vendor/shops/view', { shop, title: shop.name, timeAgo });
//     } catch (error) {
//         next(errorMessage("Something went wrong", 500));
//     }
// };

// const shipItem = async (req, res, next) => {
//     try {
//         const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
//         if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
//         res.render('vendor/shops/view', { shop, title: shop.name, timeAgo });
//     } catch (error) {
//         next(errorMessage("Something went wrong", 500));
//     }
// };

// const cancelItem = async (req, res, next) => {
//     try {
//         const shop = await Shop.findOne({ _id: req.params.id, vendorId: req.user.id });
//         if (!shop || shop.isDeleted) return next(errorMessage('Shop not found.', 404));
//         res.render('vendor/shops/view', { shop, title: shop.name, timeAgo });
//     } catch (error) {
//         next(errorMessage("Something went wrong", 500));
//     }
// };


// export default {
//     index,
//     view,
//     confirmItem,
//     shipItem,
//     cancelItem
// }