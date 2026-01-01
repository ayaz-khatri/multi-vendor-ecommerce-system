const isCustomer = (req, res, next) => {
    if (req.user && req.user.role === 'customer') {
        return next();
    }

    return res.redirect('/login');
};

export default isCustomer;
