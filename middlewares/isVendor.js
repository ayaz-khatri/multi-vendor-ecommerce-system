const isVendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        return next();
    }

    return res.redirect('/login');
};

export default isVendor;
