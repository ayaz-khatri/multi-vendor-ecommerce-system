import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import VendorOrder from "../models/VendorOrder.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import dotenv from 'dotenv';
import stripeLib from "stripe";
import errorMessage from "../utils/error-message.js";
import { generateOrderNumber } from "../utils/helper.js";
import { syncOverallOrderStatus } from '../services/orderSyncService.js';
dotenv.config();
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      req.flash("error", "Invalid checkout details.");
      return res.redirect("/cart/checkout");
    }

    // ==========================
    // FETCH CART
    // ==========================
    const cart = await Cart.findOne({ userId, isDeleted: false })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      req.flash("error", "Cart is empty.");
      return res.redirect("/cart/checkout");
    }

    const vendorMap = {};
    const orderItems = [];

    // ==========================
    // VALIDATE STOCK & PREPARE ITEMS
    // ==========================
    for (const item of cart.items) {
      const product = item.productId;

      if (!product || product.isDeleted) {
        req.flash("error", `Product unavailable`);
        return res.redirect("/cart/checkout");
      }

      if (product.stock < item.quantity) {
        req.flash("error", `Insufficient stock for ${product.name}`);
        return res.redirect("/cart/checkout");
      }

      const itemData = {
        productId: product._id,
        shopId: product.shopId,
        vendorId: product.vendorId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
        status: "pending",
      };

      orderItems.push(itemData);

      const vendorIdStr = product.vendorId.toString();
      if (!vendorMap[vendorIdStr]) vendorMap[vendorIdStr] = [];
      vendorMap[vendorIdStr].push(itemData);
    }

    // ==========================
    // TOTALS
    // ==========================
    const totalQuantity = orderItems.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = orderItems.reduce((s, i) => s + i.subtotal, 0);

    // ==========================
    // CREATE ORDER
    // ==========================
    const order = await Order.create({
      userId,
      orderNumber: generateOrderNumber(),
      totalQuantity,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending", // ALWAYS pending initially
      overallStatus: "pending",
    });

    // ==========================
    // CREATE VENDOR ORDERS
    // ==========================
    for (const vendorId of Object.keys(vendorMap)) {
      const items = vendorMap[vendorId];
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

      await VendorOrder.create({
        orderId: order._id,
        vendorId,
        items,
        subtotal,
        commission: 0,
        vendorEarning: subtotal,
        vendorStatus: "pending",
        vendorEarningStatus: "pending",
      });
    }

    // ==========================
    // COD: DEDUCT STOCK + CLEAR CART
    // ==========================
    if (paymentMethod === "cod") {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      await Cart.findOneAndUpdate(
        { userId },
        { items: [], totalQuantity: 0, totalPrice: 0 }
      );

      req.flash("success", "Order placed successfully.");
      return res.redirect(`/orders/${order._id}`);
    }

    // ==========================
    // STRIPE: CREATE PAYMENT INTENT
    // ==========================
    let clientSecret = null;

    if (paymentMethod === "stripe") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: "usd",
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      });

      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();

      clientSecret = paymentIntent.client_secret;
    }

    // ==========================
    // STRIPE RESPONSE
    // ==========================
    req.flash("success", "Order created successfully.");
    return res.json({ clientSecret, orderId: order._id });

  } catch (error) {
    return next(errorMessage("Something went wrong", 500));
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
    const orderId = req.params.id;
    const userId = req.user.id;

    // Fetch main order (ownership check)
    const order = await Order.findOne({ _id: orderId, userId, isDeleted: false });
    if (!order) return next(errorMessage("Order not found.", 404));

    // Fetch vendor orders related to this order
    const vendorOrders = await VendorOrder.find({ orderId: order._id })
                                          .populate('items.productId')
                                          .populate('items.shopId')
                                          .populate('vendorId');

    // Generate reviewableItems
    let reviewableItems = [];

    for (const vOrder of vendorOrders) {
      // Only process if the vendor order is delivered
      if (vOrder.vendorStatus !== 'delivered') continue;

      for (const item of vOrder.items) {

        // Check if review already exists
        const reviewExists = await Review.exists({ userId, productId: item.productId._id, isDeleted: false });

        if (!reviewExists) {
          reviewableItems.push({
            productId: item.productId._id,
            productName: item.productId.name || item.name,
            shopId: item.shopId._id,
            vendorId: vOrder.vendorId._id
          });
        }
      }
    }

    // Render frontend page
    res.render('frontend/order', { title: 'Order Details', order, vendorOrders, reviewableItems });

  } catch (error) {
    next(errorMessage('Something went wrong', 500));
  }
};

const cancel = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return next(errorMessage('Order not found.', 404));

    // Fetch related vendorOrders
    const vendorOrders = await VendorOrder.find({ orderId: order._id });

    // Check if any vendor has shipped or delivered
    const blocked = vendorOrders.some(vo => ['shipped', 'delivered'].includes(vo.vendorStatus));

    if (blocked) {
      req.flash("error", 'Order cannot be cancelled because one or more vendors have already shipped.');
      return res.redirect("/orders/" + req.params.id);
    }

    // Cancel all vendor orders
    for (let vo of vendorOrders) {
      vo.vendorStatus = 'cancelled';
      await vo.save();
    }

    // Cancel main order
    order.overallStatus = 'cancelled';
    await order.save();

    req.flash('success', 'Order cancelled successfully.');
    res.redirect('/orders');

  } catch (error) {
    next(errorMessage('Something went wrong', 500));
  }
};

const vendorOrderCancel = async (req, res, next) => {
  try {
    const vendorOrderId = req.params.id;

    // Find vendor order
    const vendorOrder = await VendorOrder.findById(vendorOrderId);
    if (!vendorOrder) { return next(errorMessage("Vendor order not found.", 404)); }

    // Find parent order (ownership check)
    const order = await Order.findOne({ _id: vendorOrder.orderId, userId: req.user.id });

    if (!order) { return next(errorMessage("Unauthorized action.", 403)); }

    // Status validation
    if (['shipped', 'delivered'].includes(vendorOrder.vendorStatus)) {
      req.flash("error", 'Order cannot be cancelled because this order is already shipped.');
      return res.redirect("/orders/" + req.params.id);
    }

    // Cancel vendor order
    vendorOrder.vendorStatus = 'cancelled';
    await vendorOrder.save();

    // Recalculate order totals correctly
    const activeVendorOrders = await VendorOrder.find({ orderId: order._id, vendorStatus: { $ne: 'cancelled' } });

    order.totalQuantity = activeVendorOrders.reduce((orderSum, vo) => {
      const vendorQty = vo.items.reduce(
        (itemSum, item) => itemSum + item.quantity,
        0
      );
      return orderSum + vendorQty;
    }, 0);

    order.totalPrice = activeVendorOrders.reduce(
      (sum, vo) => sum + vo.subtotal,
      0
    );

    // Update overall order status
    if (activeVendorOrders.length === 0) {
      order.overallStatus = 'cancelled';
    }

    await order.save();
    await syncOverallOrderStatus(order._id);

    req.flash("success", "Item cancelled successfully.");
    res.redirect(`/orders/${order._id}`);

  } catch (error) {
    next(errorMessage("Something went wrong", 500));
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent( req.body, sig, process.env.STRIPE_WEBHOOK_SECRET );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("Stripe Event:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const orderId = intent.metadata.orderId;

    console.log("Order ID from Stripe:", orderId);

    const order = await Order.findById(orderId);
    if (!order) return res.json({ received: true });

    // Prevent double processing (VERY IMPORTANT)
    if (order.paymentStatus === "paid") {
      console.log("Order already paid, skipping");
      return res.json({ received: true });
    }

    // Mark order paid
    order.paymentStatus = "paid";
    await order.save();

    console.log("Order marked as PAID:", order._id);

    // Deduct vendor stock
    const vendorOrders = await VendorOrder.find({ orderId });

    for (const vo of vendorOrders) {
      for (const item of vo.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    console.log("Stock updated");

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: order.userId },
      { items: [], totalQuantity: 0, totalPrice: 0 }
    );

    console.log("Cart cleared");
  }

  res.json({ received: true });
};

export default {
  placeOrder,
  orders,
  order,
  cancel,
  vendorOrderCancel,
  stripeWebhook
}