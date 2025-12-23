import {body} from 'express-validator';

const vendorValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Vendor name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Vendor name must be at least 3 and at most 50 characters long.'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.'),
    
    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.')
];

const vendorUpdateValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Vendor name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Vendor name must be at least 3 and at most 50 characters long.'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.'),
    
    body('password')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.')
];

const loginValidation = [
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.')
];

const userValidation = [
     body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 5, max: 50 }).withMessage('Name must be at least 5 and at most 50 characters long.'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.'),

    body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Confirm password must be at least 8 and at most 20 characters long.')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match.');
        }
        return true;
    }),

    body('role')
    .trim()
    .notEmpty().withMessage('Role is required.')
    .isIn(['customer', 'vendor']).withMessage('Role must be either Customer or Vendor.')
];

const forgotPasswordValidation = [
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
];

const resetPasswordValidation = [
    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.')
];

const categoryValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Category name must be at least 3 and at most 50 characters long.'),

    body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 200 }).withMessage('Description can be at most 200 characters long.'),

    body('parentCategory')
    .trim()
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('Invalid parent category ID.')
];

const shopValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Shop name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Shop name must be at least 3 and at most 50 characters long.'),

    body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 200 }).withMessage('Description can be at most 200 characters long.'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.'),

    body('address')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 200 }).withMessage('Address can be at most 200 characters long.')
];

const productValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Product name must be between 3 and 50 characters.'),

    body('description')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 200 }).withMessage('Description can be at most 200 characters long.'),

    body('price')
    .trim()
    .notEmpty().withMessage('Price is required.')
    .isFloat({ gt: 0 }).withMessage('Price must be a valid positive number.')
    .toFloat(),

    body('discountPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be a valid number.')
    .toFloat()
    .optional({ checkFalsy: true })
    .custom((value, { req }) => { if (value >= req.body.price) { throw new Error('Discount price must be less than the original price.'); } return true; }),

    body('stock')
    .trim()
    .notEmpty().withMessage('Stock is required.')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.')
    .toInt(),

    body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required.')
    .isLength({ min: 3, max: 30 }).withMessage('SKU must be between 3 and 30 characters.')
    .toUpperCase(),

    body('categoryId')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isMongoId().withMessage('Invalid category ID.'),

    body('shopId')
    .trim()
    .notEmpty().withMessage('Shop is required.')
    .isMongoId().withMessage('Invalid shop ID.'),    

];

const profileValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be at least 3 and at most 50 characters long.'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.'),
];

const passwordUpdateValidation = [
    body('oldPassword')
    .trim()
    .notEmpty().withMessage('Old Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.'),

    body('newPassword')
    .trim()
    .notEmpty().withMessage('New Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.'),

    body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Confirm password must be at least 8 and at most 20 characters long.')
    .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Passwords do not match.');
        }
        return true;
    }),
];

export default { 
    loginValidation,
    userValidation,
    vendorValidation,
    vendorUpdateValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    categoryValidation,
    shopValidation,
    productValidation,
    profileValidation,
    passwordUpdateValidation
};
