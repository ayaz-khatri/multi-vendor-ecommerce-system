import News from "../models/News.js";
import Category from "../models/Category.js";
import Setting from "../models/Setting.js";

const loadCommonData = async (req, res, next) => {
    try {
        const latestNews = await News.find()
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({timestamps: -1})
                                .limit(5);

        const settings = await Setting.findOne();
        
        const categoriesInUse = await News.distinct('category');
        const categories = await Category.find({'_id': {'$in': categoriesInUse}});

        res.locals.latestNews = latestNews;
        res.locals.settings = settings;
        res.locals.categories = categories;
        next();
    } catch (error) {
        next(error);
    }
}

export default loadCommonData;