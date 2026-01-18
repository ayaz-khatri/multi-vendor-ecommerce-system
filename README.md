# Multi Vendor Ecommerce System

A full-stack **Multi Vendor Ecommerce System** built using **Node.js, Express.js, and MongoDB**, designed to support multiple sellers, product management, orders, and secure user authentication.  
This project demonstrates real-world backend architecture, role-based access, and scalable ecommerce workflows.

---

## 🚀 Features

### 👥 User Management
- User registration and login with secure authentication
- Role-based access control (Admin, Vendor, Customer)
- JWT-based authentication
- Google OAuth login integration

### 🛒 Product & Category Management
- Vendors can create, update, and delete their own products
- Product categorization and filtering
- Advanced product search and filters
- Product images upload and management
- Product availability and stock control

### 🏬 Multi-Vendor Support
- Multiple vendors can sell products independently
- Vendor-specific dashboards
- Vendor product isolation (vendors manage only their own products)

### 📦 Order Management
- Customers can place orders for multiple products
- Order history for customers
- Vendors can view orders related to their products
- Order status tracking
- Stripe Payment Gateway Integration

### ⭐ Reviews & Ratings
- Customers can submit product reviews
- Reviews displayed independently from product listings
- Vendor-specific and product-specific feedback handling

### 🛠 Admin Dashboard
- Manage users, vendors, and products
- Monitor platform activity
- Centralized control over the system

### 🔐 Security & Best Practices
- Environment variable management using `.env`
- Input validation and secure routes
- Clean MVC-based project structure
- Modular and scalable codebase

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB
- **Authentication:** JWT, Google OAuth  
- **Templating Engine:** EJS  
- **Session Management:** Express-session  
- **File Uploads:** Multer  


---

## Installation

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file using `.env.example`
4. Run `npm start`
