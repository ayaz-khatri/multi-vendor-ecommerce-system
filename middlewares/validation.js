import {body} from 'express-validator';

const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .matches(/^\S+$/).withMessage('Username must not contain spaces.')
    .isLength({ min: 5, max: 20 }).withMessage('Username must be at least 5 and at most 20 characters long.'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.')
];

const userValidation = [
     body('fullname')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 5, max: 50 }).withMessage('Fullname must be at least 5 and at most 50 characters long.'),

    body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .matches(/^\S+$/).withMessage('Username must not contain spaces.')
    .isLength({ min: 5, max: 20 }).withMessage('Username must be at least 5 and at most 20 characters long.'),

    body('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.'),

    body('role')
    .trim()
    .notEmpty().withMessage('Role is required.')
    .isIn(['admin', 'author']).withMessage('Role must be either admin or author.')
];

const userUpdateValidation = [
     body('fullname')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 5, max: 50 }).withMessage('Fullname must be at least 5 and at most 50 characters long.'),

    body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 20 }).withMessage('Password must be at least 8 and at most 20 characters long.'),

    body('role')
    .trim()
    .notEmpty().withMessage('Role is required.')
    .isIn(['admin', 'author']).withMessage('Role must be either admin or author.')
];

const categoryValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Category name must be at least 3 and at most 50 characters long.'),

    body('description')
    .isLength({ max: 200 }).withMessage('Description must be at most 200 characters long.')
];

const articleValidation = [
    body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be at least 5 and at most 100 characters long.'),

    body('content')
    .trim()
    .notEmpty().withMessage('Content is required.')
    .isLength({ min: 10, max: 1000 }).withMessage('Content must be at least 10 and at most 1000 characters long.'),

    body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')

];

export default { 
    loginValidation,
    userValidation,
    userUpdateValidation,
    categoryValidation,
    articleValidation
};
