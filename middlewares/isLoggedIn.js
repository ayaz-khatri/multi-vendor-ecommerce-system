import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash("error", "Unauthorized access. Please log in.");
            return res.redirect("/login");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.isLoggedIn = true;
        res.locals.authUser = decoded;
        next();
    } catch (error) {
        req.flash("error", "Something went wrong. Please log in again.");
        return res.redirect('/login');
    }
};  

export default isLoggedIn;