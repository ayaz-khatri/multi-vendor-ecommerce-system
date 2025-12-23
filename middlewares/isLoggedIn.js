import dotenv from 'dotenv';
dotenv.config();

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash("error", "Unauthorized access. Please log in.");
            return res.redirect("/login");
        }
        next();
    } catch (error) {
        req.flash("error", "Something went wrong. Please log in again.");
        return res.redirect('/login');
    }
};  

export default isLoggedIn;