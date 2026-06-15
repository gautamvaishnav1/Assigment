import { body } from 'express-validator';

export const productValidator = [
  body('productName').notEmpty().withMessage('Product name is required'),
  body('productType').notEmpty().withMessage('Product type is required'),
  body('brandName').notEmpty().withMessage('Brand name is required'),
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isNumeric().withMessage('Selling price must be a number')
    .custom((value) => value >= 0).withMessage('Selling price must be greater than or equal to 0'),
  body('mrp')
    .notEmpty().withMessage('MRP is required')
    .isNumeric().withMessage('MRP must be a number')
    .custom((value) => value >= 0).withMessage('MRP must be greater than or equal to 0'),
  body('quantityStock')
    .notEmpty().withMessage('Quantity stock is required')
    .isNumeric().withMessage('Quantity stock must be a number')
    .custom((value) => value >= 0).withMessage('Quantity stock must be greater than or equal to 0'),
  body('exchange').isBoolean().withMessage('Exchange must be a boolean value')
];
