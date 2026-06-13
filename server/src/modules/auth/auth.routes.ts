import express from 'express'
import * as authController from './auth.controller'
import * as authValidator from './auth.validator'
import * as authMiddleware from './auth.middleware'
const authRouter = express.Router()

authRouter.post(
  '/register',
  authValidator.registerValidator,
  authController.registerController
)
authRouter.post(
  '/login',
  authValidator.loginValidator,
  authController.loginController
)
authRouter.post(
  '/otp-verify',
  authValidator.otpVerifyValidator,
  authController.otpVerifyController
)
authRouter.get(
  '/getMe',
  authMiddleware.authMiddlewareForAuthorization,
  authController.getMeController
)
authRouter.get(
  '/refreshToken',
  authMiddleware.authMiddlewareForCookies,
  authController.refreshTokenController
)
authRouter.post(
  '/logout',
  authMiddleware.authMiddlewareForAuthorization,
  authController.logoutController
)
authRouter.post(
  '/logout-from-all-device',
  authMiddleware.authMiddlewareForCookies,
  authController.logOutAllController
)
authRouter.post(
  '/forget-password',
  authValidator.forgetPasswordValidator,
  authController.forgetPasswordController
)
export default authRouter
