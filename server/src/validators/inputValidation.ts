import { body, ValidationChain } from 'express-validator'

// Registration validation
export const registerValidation: ValidationChain[] = [
    body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape(),
    
    body("username")
        .trim()
        .isLength({ min: 3, max: 25 }).withMessage("Username must be between 3 and 25 characters")
        .escape(),
    
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[#!&?@$%^*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage("Password must contain at least one special character")
        .escape()
]

// Login validation
export const loginValidation: ValidationChain[] = [
    body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape(),
    
    body("password")
        .notEmpty().withMessage("Password is required")
        .escape()
]