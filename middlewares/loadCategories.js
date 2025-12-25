import Category from '../models/Category.js';
import Product from '../models/Product.js';
import buildCategoryTree from '../utils/categoryTree.js';

const loadCategories = async (req, res, next) => {
    try {
        // Fetch categories
        const categories = await Category.find({ isDeleted: false })
            .select('_id name slug parentCategory icon')
            .sort({ name: 1 })
            .lean();

        // Get product counts (direct products only)
        const productCounts = await Product.aggregate([
            { $match: { isDeleted: false, categoryId: { $ne: null } } },
            { $group: { _id: "$categoryId", count: { $sum: 1 } } }
        ]);


        // Map counts by category id
        const countMap = {};
        productCounts.forEach(pc => {
            countMap[pc._id.toString()] = pc.count;
        });

        // Build hierarchical tree with counts
        res.locals.categories = buildCategoryTree(categories, countMap);

        next();
    } catch (error) {
        next(error);
    }
};

export default loadCategories;
