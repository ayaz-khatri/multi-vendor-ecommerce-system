import Review from '../models/Review.js';
import Product from '../models/Product.js';
import errorMessage from '../utils/error-message.js';

const submit = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, shopId, vendorId, rating, comment, orderId } = req.body;

        if (!productId || !rating) {
            req.flash("error", "Rating is required.");
            return res.redirect("orders");
        }

        const existingReview = await Review.findOne({ userId, productId, isDeleted: false });

        if (existingReview) {
            req.flash("error", "You have already submitted a review for this product.");
            return res.redirect("orders");
        }

        await Review.create({ userId, productId, shopId, vendorId, orderId, rating, comment });

        const product = await Product.findById(productId);
        const reviews = await Review.find({ productId, isApproved: true });
        const count = reviews.length;
        const avg = count ? parseFloat((reviews.reduce((sum,r) => sum + r.rating, 0)/count).toFixed(1)) : 0;

        product.reviewCount = count;
        product.avgRating = avg;
        await product.save();

        req.flash("success","Thank you for your feedback. Review submitted successfully.");
        return res.redirect("orders");

    } catch (error) {
        // Handle duplicate key race condition (extra safety)
        if (error.code === 11000) {
            req.flash("error","You have already submitted a review for this product.");
            return res.redirect("orders");
        }
        next(errorMessage("Something went wrong", 500));
    }
};

export default {
    submit
};
