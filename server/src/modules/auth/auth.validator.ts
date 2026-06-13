import { body } from 'express-validator'

export const registerValidator = [
  body('email')
    .notEmpty()
    .withMessage('email is required for creating account')
    .isEmail()
    .withMessage('provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('password is required for create account')
    .isLength({ min: 6, max: 20 })
    .withMessage(
      'password must contain 6 character long and less then 20 characters '
    ),
  body('name').notEmpty().withMessage('name is required')
]

export const loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('please provide a valid email 1')
    .isEmail()
    .withMessage('please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('password is required for login')
    .isLength({ min: 6, max: 20 })
    .withMessage('password must contain 6 character or long')
]

export const otpVerifyValidator=[
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('email is required'),
  body('otp').notEmpty().withMessage('otp is required').isLength({min:5,max:5}).withMessage('otp should be 5 digits')
]
export const forgetPasswordValidator=[
  body('email').isEmail().withMessage('email is required').notEmpty().withMessage('email is required')
]