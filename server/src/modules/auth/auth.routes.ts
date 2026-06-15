import express from 'express'
import * as authController from './auth.controller'
import * as authValidator from './auth.validator'
import * as authMiddleware from './auth.middleware'
const authRouter = express.Router()

authRouter.post(
  '/otp-generate',
  authValidator.registerValidator,
  authController.otpGenerateController
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

export default authRouter
