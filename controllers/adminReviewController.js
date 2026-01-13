import Review from "../models/Review.js";
import errorMessage from "../utils/error-message.js";

const index = async (req, res, next) => {
    try {
        const reviews = await Review.find({ isDeleted: false })
                                    .populate('orderId', 'orderNumber')
                                    .populate('productId', 'name')
                                    .populate('userId', 'name email')
                                    .sort({ createdAt: -1 });
        res.render('admin/reviews', { reviews, title: 'Reviews' });
    } catch (error) {
        next(errorMessage("Something went wrong", 500));
    }
};

const toggle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.isApproved = !review.isApproved;
        await review.save();

        req.flash('success', `Review ${review.isApproved ? "approved" : "disapproved"} successfully`);
        res.redirect('/admin/reviews');

    } catch (error) {
        next(errorMessage("Failed to update review status", 500));
    }
};


export default {
    index,
    toggle
};