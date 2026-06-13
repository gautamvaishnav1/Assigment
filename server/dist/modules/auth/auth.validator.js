"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPasswordValidator = exports.otpVerifyValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('email')
        .notEmpty()
        .withMessage('email is required for creating account')
        .isEmail()
        .withMessage('provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('password is required for create account')
        .isLength({ min: 6, max: 20 })
        .withMessage('password must contain 6 character long and less then 20 characters '),
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required')
];
exports.loginValidator = [
    (0, express_validator_1.body)('email')
        .notEmpty()
        .withMessage('please provide a valid email 1')
        .isEmail()
        .withMessage('please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('password is required for login')
        .isLength({ min: 6, max: 20 })
        .withMessage('password must contain 6 character or long')
];
exports.otpVerifyValidator = [
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isEmail().withMessage('email is required'),
    (0, express_validator_1.body)('otp').notEmpty().withMessage('otp is required').isLength({ min: 5, max: 5 }).withMessage('otp should be 5 digits')
];
exports.forgetPasswordValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('email is required').notEmpty().withMessage('email is required')
];
//# sourceMappingURL=auth.validator.js.map