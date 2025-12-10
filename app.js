import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
// import vendorRoutes from './routes/vendor.js';
// import customerRoutes from './routes/customer.js';
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------- Initialize Express App ------------------------- */
const app = express();

/* ------------------------------- Middlewares ------------------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressLayouts);
app.set('layout', 'layouts/authLayout');
app.set('view engine', 'ejs');

/* --------------------------- Database Connection -------------------------- */
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Database Connected."))
.catch(err => console.log(err));

/* --------------------------------- Routes --------------------------------- */
app.use('/admin', (req, res, next)=>{
  res.locals.layout = 'layouts/adminLayout';
  next();
});
app.use('/vendor', (req, res, next)=>{
  res.locals.layout = 'layouts/vendorLayout';
  next();
});
app.use('/customer', (req, res, next)=>{
  res.locals.layout = 'layouts/customerLayout';
  next();
});
app.use('/frontend', (req, res, next)=>{
  res.locals.layout = 'layouts/frontendLayout';
  next();
});
app.use('/admin', adminRoutes);
// app.use('/vendor', vendorRoutes);
// app.use('/customer', customerRoutes);
app.use(authRoutes);

// app.get('/', (req, res) => {
//     res.send("Hello World! Welcome to Multi Vendor Ecommerce System.");
// });

/* ---------------------------- Start the server ---------------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
