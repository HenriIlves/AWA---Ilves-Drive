import { body, param, ValidationChain } from "express-validator";

export const createDocumentValidation: ValidationChain[] = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 255 })
        .withMessage("Title must not exceed 255 characters")
        .escape(),
    body("content")
        .optional()
        .isString()
        .withMessage("Content must be a string"),
]

export const deleteDocumentValidation: ValidationChain[] = [
    param("documentId")
        .isMongoId()
        .withMessage("Invalid document ID"),
]

export const updateDocumentValidation: ValidationChain[] = [
    param("documentId")
        .isMongoId()
        .withMessage("Invalid document ID"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 255 })
        .withMessage("Title must not exceed 255 characters")
        .escape(),
    body("content")
        .optional()
        .isString().
        withMessage("Content must be a string"),
]

export const grantPermissionValidation: ValidationChain[] = [
    param("documentId")
        .isMongoId()
        .withMessage("Invalid document ID"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .escape(), 
    body("permissionType")
        .isIn(["view", "edit"])
        .withMessage("Permission type must be either 'view' or 'edit'"),
]

export const removePermissionValidation: ValidationChain[] = [
    param("documentId")
        .isMongoId()
        .withMessage("Invalid document ID"),
    body("userId")
        .isMongoId()
        .withMessage("Invalid user ID"),
]