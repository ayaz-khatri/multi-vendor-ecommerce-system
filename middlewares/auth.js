import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const auth = async (req, res, next) => {
     const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if(!user || user.isDeleted){
                res.clearCookie('token'); 
                return next(); 
            }
            req.user = user;
            res.locals.isLoggedIn = true;
            res.locals.authUser = user;
        } catch (err) {
            res.locals.isLoggedIn = false;
        }
    } else {
        res.locals.isLoggedIn = false;
    }

    next();
};  

export default auth;