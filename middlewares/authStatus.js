import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authStatus = async (req, res, next) => {
     const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.isLoggedIn = true;
            res.locals.user = decoded;
        } catch (err) {
            res.locals.isLoggedIn = false;
        }
    } else {
        res.locals.isLoggedIn = false;
    }

    next();
};  

export default authStatus;