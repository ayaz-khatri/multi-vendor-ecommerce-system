import jwt from "jsonwebtoken";

const redirectIfLoggedIn = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(); // user not logged in → continue to login page
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.redirect('/admin/dashboard'); // already logged in
    } catch (error) {
        return next(); // invalid token → treat as not logged in
    }
};

export default redirectIfLoggedIn;
