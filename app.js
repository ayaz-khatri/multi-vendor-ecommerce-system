import express from 'express';
import mongoose from 'mongoose';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import session from "express-session";
import flash from "connect-flash";
import path from 'path';
import __dirname from './utils/dirname.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import auth from "./middlewares/auth.js";
import vendorRoutes from './routes/vendor.js';
import profileRoutes from './routes/profile.js';
import frontendRoutes from './routes/frontend.js';
import customerOrderController from './controllers/customerOrderController.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

/* ------------------------- Initialize Express App ------------------------- */
const app = express();

app.post("/webhook/stripe", bodyParser.raw({ type: "application/json" }), customerOrderController.stripeWebhook);

/* ------------------------------- Middlewares ------------------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressLayouts);
app.set('layout', 'layouts/frontendLayout');
app.set('view engine', 'ejs');
app.use(auth);

/* --------------------------- Database Connection -------------------------- */
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Database Connected."))
.catch(err => console.log(err));

/* ------------------------------ connect-flash ----------------------------- */
app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// Make flash available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.old = req.flash("old")[0] || {};
    next();
});

/* --------------------------------- Routes --------------------------------- */

app.use('/admin', (req, res, next)=>{
  res.locals.layout = 'layouts/adminLayout';
  next();
});
app.use('/vendor', (req, res, next)=>{
  res.locals.layout = 'layouts/vendorLayout';
  next();
});
app.use('/profile', (req, res, next)=>{
  res.locals.layout = 'layouts/authLayout';
  next();
});
app.use('/customer', (req, res, next)=>{
  res.locals.layout = 'layouts/customerLayout';
  next();
});

app.use('/admin', adminRoutes);
app.use('/vendor', vendorRoutes);
app.use('/profile', profileRoutes);
app.use('/', frontendRoutes);
app.use(authRoutes);


app.use('', (req, res, next) => {
    res.status(404).render('common/404',{
        message: 'Page Not Found'
    });
});


// Error Handling Middleware
app.use('',(err, req, res, next) => {
    console.log(err.stack);
    const status = err.status || 500;
    res.status(status).render('common/error',{
        status: status,
        message: err.message || 'Something went wrong!',
        role: req.role
    });
});

/* ---------------------------- Start the server ---------------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});