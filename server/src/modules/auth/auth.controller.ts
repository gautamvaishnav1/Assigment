import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as authServices from './auth.service'
import { validationResult } from 'express-validator'
import userModel from './auth.model'
import jwt from 'jsonwebtoken'
import tempUserCache from '../../config/nodeCache'
// import * as authMiddleware from './auth.middleware'
import config from '../../config/config'
import sessionModel from '../../features/session/session.model'

const saltRound = { RefreshSalt: 10, passwordSalt: 15 }

export const otpGenerateController = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'validation error',
      errors: errors.array()
    })
  }

  try {
    const { name, email } = req.body

    const otp = authServices.generateOtp()
console.log(otp)
    const hashOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex')

    tempUserCache.set(
      email,
      {
        name,
        email,
        hashOtp
      },
      5 * 60
    )

    await authServices.otpEmail(email, otp)

    return res.status(200).json({
      success: true,
      message: 'otp sent successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'internal server error'
    })
  }
}

export const otpVerifyController = async (
  req: Request,
  res: Response
) => {
  const { email, otp } = req.body

  try {
    const pendingUser = tempUserCache.get<{
      name: string
      email: string
      hashOtp: string
    }>(email)

    if (!pendingUser) {
      return res.status(401).json({
        success: false,
        message: 'otp expired'
      })
    }

    const hashOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex')

    if (hashOtp !== pendingUser.hashOtp) {
      return res.status(403).json({
        success: false,
        message: 'invalid otp'
      })
    }

    let user = await userModel.findOne({
      email: pendingUser.email
    })

    if (!user) {
      user = await userModel.create({
        name: pendingUser.name,
        email: pendingUser.email
      })
    }

    const refreshToken = jwt.sign(
      { id: user._id },
      config.SECRET_KEY,
      {
        expiresIn: '7d'
      }
    )

    const hashRefreshToken = await bcrypt.hash(
      refreshToken,
      saltRound.RefreshSalt
    )

    const session = await sessionModel.create({
      userId: user._id,
      revoke: false,
      refreshToken: hashRefreshToken
    })

    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id
      },
      config.SECRET_KEY,
      {
        expiresIn: '15m'
      }
    )

    tempUserCache.del(email)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      success: true,
      message: 'authentication successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'internal server error',
      error
    })
  }
}

export const refreshTokenController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = (req as any).user.id
    const sessionId = (req as any).user.sessionId

    const session = await sessionModel.findOne({
      _id: sessionId,
      userId: id,
      revoke: false
    })

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'session expired'
      })
    }

    const refreshToken = jwt.sign(
      { id },
      config.SECRET_KEY,
      {
        expiresIn: '7d'
      }
    )

    const hashRefreshToken = await bcrypt.hash(
      refreshToken,
      saltRound.RefreshSalt
    )

    session.refreshToken = hashRefreshToken
    await session.save()

    const accessToken = jwt.sign(
      {
        id,
        sessionId: session._id
      },
      config.SECRET_KEY,
      {
        expiresIn: '15m'
      }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      success: true,
      message: 'token refreshed',
      accessToken
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'internal server error'
    })
  }
}

export const getMeController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = (req as any).user.id

    const user = await userModel.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'user not found'
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'internal server error'
    })
  }
}

export const logoutController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = (req as any).user.id
    const sessionId = (req as any).user.sessionId

    const session = await sessionModel.findOne({
      _id: sessionId,
      userId: id,
      revoke: false
    })

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'session not found'
      })
    }

    session.revoke = true
    await session.save()

    res.clearCookie('refreshToken')

    return res.status(200).json({
      success: true,
      message: 'logout successful'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'internal server error'
    })
  }
}