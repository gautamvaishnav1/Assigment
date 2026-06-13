import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as authServices from './auth.service'
import { validationResult } from 'express-validator'
import userModel from './auth.model'
import jwt from 'jsonwebtoken'
// import ioredis from 'redis'
import * as authMiddleware from './auth.middleware'
import config from '../../config/config'
import sessionModel from '../../features/session/session.model'
import redis from '../../config/redis'
const saltRound = { RefreshSalt: 10, passwordSalt: 15 }
export const registerController = async (req: Request, res: Response) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
      error: errors.array(),
      success:false
    })
  }

  try {
    const { email, password, name } = req.body
    const isExist = await userModel.findOne({ email })
    if (isExist) {
      return res.status(409).json({
        message: 'user is already exist',
        success:false
      })
    }
    const hashPassword = await bcrypt.hash(password, saltRound.passwordSalt)
    const otp = authServices.generateOtp()
    const hashOtp = crypto.createHash('sha256').update(otp).digest('hex')
    console.log(otp)
    // const generated=authServices.otpEmail(email,otp)
    // console.log(generated)
    await redis.set(
      `pending-user:${email}`,
      JSON.stringify({ email, name, password: hashPassword }),
      'EX',
      600
    )
  const response=  await redis.set(`otp:${email}`, hashOtp, 'EX', 600)
    console.log(response,"response")
    res.status(200).json({
      message: 'otp sent successfully',
      otp,
      success: true
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error'
    })
  }
}
/**
 *
 * @param req email,otp
 * @param res for success full creating a user
 * @returns  res
 */
export const otpVerifyController = async (req: Request, res: Response) => {
  console.log(req.body)
  const { email, otp } = req.body
  try {
    const storedOtp = await redis.get(`otp:${email}`)
    console.log(storedOtp)
    if (!storedOtp) {
      return res.status(401).json({
        message: 'otp validation expired',
        success: false
      })
    }
    const hashOtp = crypto.createHash('sha256').update(otp).digest('hex')
    if (hashOtp !== storedOtp) {
      return res.status(403).json({
        message: 'invalid otp',
        success: false
      })
    }
    const pendingUser = await redis.get(`pending-user:${email}`)
    if (!pendingUser) {
      return res.status(400).json({
        message: 'session expired',
        success: false
      })
    }
    await redis.del(`pending-user:${email}`)
    await redis.del(`otp:${email}`)
    const userData = JSON.parse(pendingUser)
    const user = await userModel.create(userData)
    const refreshToken = jwt.sign({ id: user._id }, config.SECRET_KEY, {
      expiresIn: '7d'
    })
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
      { id: user._id, sessionId: session._id },
      config.SECRET_KEY,
      { expiresIn: '15m' }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true
    })
    res.status(201).json({
      message: 'user register successfully',
      success: true,
      user:{name: user.name,
      id: user._id,
      email: user.email,},
      accessToken
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error'
    })
  }
}

export const loginController = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
      error: errors.array(),
      success: false
    })
  }
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(409).json({
        message: 'user not found ',
        success: false
      })
    }
    const isMatchPassword = await bcrypt.compare(password, user.password)
    if (!isMatchPassword) {
      return res.status(401).json({
        message: 'invalid email and password ',
        success:false
      })
    }
    const refreshToken = jwt.sign({ id: user._id }, config.SECRET_KEY, {
      expiresIn: '7d'
    })
    const hashRefreshToken = await bcrypt.hash(
      refreshToken,
      saltRound.RefreshSalt
    )
    const session = await sessionModel.create({
      userId: user._id,
  
      refreshToken: hashRefreshToken
    })
    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      config.SECRET_KEY,
      { expiresIn: '10m' }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 60 * 60 * 24 * 1000,
      secure: true,
      sameSite: 'strict'
    })
    res.status(200).json({
      message: 'login success',
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error',
      success: false
    })
  }
}

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user.id
    const session = await sessionModel.findOne({
      userId: id,
      revoke: false
    })
    if (!session) {
      return res.status(400).json({
        message: 'token & session expired',
        success: false
      })
    }
    const newRefreshToken = jwt.sign({ id }, config.SECRET_KEY, {
      expiresIn: '7d'
    })
    const hashNewRefreshToken = await bcrypt.hash(
      newRefreshToken,
      saltRound.RefreshSalt
    )
    const accessToken = jwt.sign(
      { id, sessionId: session._id },
      config.SECRET_KEY,
      { expiresIn: '15m' }
    )
    session.refreshToken = hashNewRefreshToken
    await session.save()
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(200).json({
      message: 'access token generated',
      success: true,
      accessToken
    })
  } catch (error) {
    return res.status(500).json({
      message: 'internal server error',
      success: false
    })
    console.log('error', error)
  }
}

/**
 *
 * @param req request for get profile user
 * @param res find user from database and return user's profile
 * @returns json
 */
export const getMeController = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user.id
    const session = await sessionModel.findOne({
      userId: id,
      revoke: false
    })
    if (!session) {
      return res.status(400).json({
        message: 'access denied',
        success: false
      })
    }

    const user = await userModel.findById(id)
    if (!user) {
      return res.status(409).json({
        message: 'access denied',
        success: false
      })
    }
    res.status(200).json({
      success: true,
    user:{  id: user._id,
      name: user.name,
      email: user.email,}
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'internal server error',
      success: false,
      error
    })
  }
}

/**
 *
 * @param req logout
 * @param res logout from user's device
 * @returns  logout
 */
export const logoutController = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user.id
    const sessionId=(req as any).user.sessionId
    const session = await sessionModel.findOne({
      _id:sessionId,
      userId:id,
      revoke: false
    })
    if (!session) {
      return res.status(401).json({
        message: 'error with logout',
        success: false
      })
    }
    session.revoke = true
    await session.save()
    res.clearCookie('refreshToken')
    res.status(201).json({
      message: 'logout success fully',
      success: true
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error',
      success: false
    })
  }
}

/**
 *
 * @param req request for logout  from all device
 * @param res if success logout from all device
 * @returns logout from all device
 */
export const logOutAllController = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user.id
    const session = await sessionModel.find({ userId: id, revoke: false })

    if (!session) {
      return res.status(400).json({
        message: 'bad request',
        success: false
      })
    }
    const result = await sessionModel.updateMany(
      {
        userId: id,
        revoke: false
      },
      {
        $set: {
          revoke: true,
          refreshToken: null
        }
      }
    )
    console.log(result)
    res.status(200).json({
      message: 'logout success from all device',
      success: true
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error',
      success:false
    })
  }
}
// export const updateProfileUsingPassword=async(req:Request,res:Response)=>{
//     const refreshToken= req.cookies.refreshToken
//     const {password,email,name}=req.body
//   try {
//       if(!refreshToken){
//         return res.status(400).json({
//           message:'session expired',
//           success:false
//         })
//       }
//       const decode =JSON.parse(JSON.stringify(jwt.verify(refreshToken,config.SECRET_KEY)))
//       const userId=decode.id
//       const user=await userModel.findById(userId)
//       if(!user){
//         return res.status(400).json({
//           message:'session expired',
//           success:false
//         })
//       }
//       const isMatchPassword=await bcrypt.compare(password,user.password)
//       if(!isMatchPassword){
//         return res.status(401).json({
//           message:' incorrect password',
//           success:false
//         })
//       }

//     } catch (error) {

//     }
// }

export const forgetPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(403).json({
        message: 'email does not exist ',
        success: false
      })
    }
    const otp = authServices.generateOtp()
    const hashOtp = crypto.createHash('sha256').update(otp).digest('hex')
    console.log(otp)
    await redis.set(`otp:${email}`, hashOtp, 'EX', 600)
    res.status(200).json({
      message: 'otp sent success fully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'internal server error',
      success: false
    })
  }
}

export const forgetPasswordOtpController = async () => {}
