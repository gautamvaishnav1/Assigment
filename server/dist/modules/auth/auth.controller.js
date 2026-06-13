"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPasswordOtpController = exports.forgetPasswordController = exports.logOutAllController = exports.logoutController = exports.getMeController = exports.refreshTokenController = exports.loginController = exports.otpVerifyController = exports.registerController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const authServices = __importStar(require("./auth.service"));
const express_validator_1 = require("express-validator");
const auth_model_1 = __importDefault(require("./auth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config/config"));
const session_model_1 = __importDefault(require("../../features/session/session.model"));
const redis_1 = __importDefault(require("../../config/redis"));
const saltRound = { RefreshSalt: 10, passwordSalt: 15 };
const registerController = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array(),
            error: errors.array(),
            success: false
        });
    }
    try {
        const { email, password, name } = req.body;
        const isExist = await auth_model_1.default.findOne({ email });
        if (isExist) {
            return res.status(409).json({
                message: 'user is already exist',
                success: false
            });
        }
        const hashPassword = await bcryptjs_1.default.hash(password, saltRound.passwordSalt);
        const otp = authServices.generateOtp();
        const hashOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        console.log(otp);
        // const generated=authServices.otpEmail(email,otp)
        // console.log(generated)
        await redis_1.default.set(`pending-user:${email}`, JSON.stringify({ email, name, password: hashPassword }), 'EX', 600);
        const response = await redis_1.default.set(`otp:${email}`, hashOtp, 'EX', 600);
        console.log(response, "response");
        res.status(200).json({
            message: 'otp sent successfully',
            otp,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error'
        });
    }
};
exports.registerController = registerController;
/**
 *
 * @param req email,otp
 * @param res for success full creating a user
 * @returns  res
 */
const otpVerifyController = async (req, res) => {
    console.log(req.body);
    const { email, otp } = req.body;
    try {
        const storedOtp = await redis_1.default.get(`otp:${email}`);
        console.log(storedOtp);
        if (!storedOtp) {
            return res.status(401).json({
                message: 'otp validation expired',
                success: false
            });
        }
        const hashOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        if (hashOtp !== storedOtp) {
            return res.status(403).json({
                message: 'invalid otp',
                success: false
            });
        }
        const pendingUser = await redis_1.default.get(`pending-user:${email}`);
        if (!pendingUser) {
            return res.status(400).json({
                message: 'session expired',
                success: false
            });
        }
        await redis_1.default.del(`pending-user:${email}`);
        await redis_1.default.del(`otp:${email}`);
        const userData = JSON.parse(pendingUser);
        const user = await auth_model_1.default.create(userData);
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, config_1.default.SECRET_KEY, {
            expiresIn: '7d'
        });
        const hashRefreshToken = await bcryptjs_1.default.hash(refreshToken, saltRound.RefreshSalt);
        const session = await session_model_1.default.create({
            userId: user._id,
            revoke: false,
            refreshToken: hashRefreshToken
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, sessionId: session._id }, config_1.default.SECRET_KEY, { expiresIn: '15m' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: true
        });
        res.status(201).json({
            message: 'user register successfully',
            success: true,
            user: { name: user.name,
                id: user._id,
                email: user.email, },
            accessToken
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error'
        });
    }
};
exports.otpVerifyController = otpVerifyController;
const loginController = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array(),
            error: errors.array(),
            success: false
        });
    }
    try {
        const { email, password } = req.body;
        const user = await auth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(409).json({
                message: 'user not found ',
                success: false
            });
        }
        const isMatchPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatchPassword) {
            return res.status(401).json({
                message: 'invalid email and password ',
                success: false
            });
        }
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, config_1.default.SECRET_KEY, {
            expiresIn: '7d'
        });
        const hashRefreshToken = await bcryptjs_1.default.hash(refreshToken, saltRound.RefreshSalt);
        const session = await session_model_1.default.create({
            userId: user._id,
            refreshToken: hashRefreshToken
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, sessionId: session._id }, config_1.default.SECRET_KEY, { expiresIn: '10m' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 60 * 60 * 24 * 1000,
            secure: true,
            sameSite: 'strict'
        });
        res.status(200).json({
            message: 'login success',
            success: true,
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            success: false
        });
    }
};
exports.loginController = loginController;
const refreshTokenController = async (req, res) => {
    try {
        const id = req.user.id;
        const session = await session_model_1.default.findOne({
            userId: id,
            revoke: false
        });
        if (!session) {
            return res.status(400).json({
                message: 'token & session expired',
                success: false
            });
        }
        const newRefreshToken = jsonwebtoken_1.default.sign({ id }, config_1.default.SECRET_KEY, {
            expiresIn: '7d'
        });
        const hashNewRefreshToken = await bcryptjs_1.default.hash(newRefreshToken, saltRound.RefreshSalt);
        const accessToken = jsonwebtoken_1.default.sign({ id, sessionId: session._id }, config_1.default.SECRET_KEY, { expiresIn: '15m' });
        session.refreshToken = hashNewRefreshToken;
        await session.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'access token generated',
            success: true,
            accessToken
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'internal server error',
            success: false
        });
        console.log('error', error);
    }
};
exports.refreshTokenController = refreshTokenController;
/**
 *
 * @param req request for get profile user
 * @param res find user from database and return user's profile
 * @returns json
 */
const getMeController = async (req, res) => {
    try {
        const id = req.user.id;
        const session = await session_model_1.default.findOne({
            userId: id,
            revoke: false
        });
        if (!session) {
            return res.status(400).json({
                message: 'access denied',
                success: false
            });
        }
        const user = await auth_model_1.default.findById(id);
        if (!user) {
            return res.status(409).json({
                message: 'access denied',
                success: false
            });
        }
        res.status(200).json({
            success: true,
            user: { id: user._id,
                name: user.name,
                email: user.email, }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'internal server error',
            success: false,
            error
        });
    }
};
exports.getMeController = getMeController;
/**
 *
 * @param req logout
 * @param res logout from user's device
 * @returns  logout
 */
const logoutController = async (req, res) => {
    try {
        const id = req.user.id;
        const sessionId = req.user.sessionId;
        const session = await session_model_1.default.findOne({
            _id: sessionId,
            userId: id,
            revoke: false
        });
        if (!session) {
            return res.status(401).json({
                message: 'error with logout',
                success: false
            });
        }
        session.revoke = true;
        await session.save();
        res.clearCookie('refreshToken');
        res.status(201).json({
            message: 'logout success fully',
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            success: false
        });
    }
};
exports.logoutController = logoutController;
/**
 *
 * @param req request for logout  from all device
 * @param res if success logout from all device
 * @returns logout from all device
 */
const logOutAllController = async (req, res) => {
    try {
        const id = req.user.id;
        const session = await session_model_1.default.find({ userId: id, revoke: false });
        if (!session) {
            return res.status(400).json({
                message: 'bad request',
                success: false
            });
        }
        const result = await session_model_1.default.updateMany({
            userId: id,
            revoke: false
        }, {
            $set: {
                revoke: true,
                refreshToken: null
            }
        });
        console.log(result);
        res.status(200).json({
            message: 'logout success from all device',
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            success: false
        });
    }
};
exports.logOutAllController = logOutAllController;
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
const forgetPasswordController = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await auth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(403).json({
                message: 'email does not exist ',
                success: false
            });
        }
        const otp = authServices.generateOtp();
        const hashOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        console.log(otp);
        await redis_1.default.set(`otp:${email}`, hashOtp, 'EX', 600);
        res.status(200).json({
            message: 'otp sent success fully'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            success: false
        });
    }
};
exports.forgetPasswordController = forgetPasswordController;
const forgetPasswordOtpController = async () => { };
exports.forgetPasswordOtpController = forgetPasswordOtpController;
//# sourceMappingURL=auth.controller.js.map