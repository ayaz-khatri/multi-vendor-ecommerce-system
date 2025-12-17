import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const redirectIfLoggedIn = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return next(); // Not logged in → allow access (login/register pages)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const redirectMap = {
            admin: "/admin",
            vendor: "/vendor",
            customer: "/"
        };

        return res.redirect(redirectMap[decoded.role] || "/");
    } catch (err) {
        return next(); // Invalid or expired token → treat as not logged in
    }
};

export default redirectIfLoggedIn;
