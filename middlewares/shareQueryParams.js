export default (req, res, next) => {
    res.locals.query = req.query;
    next();
};
