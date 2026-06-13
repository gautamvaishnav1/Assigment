import { Request, Response } from 'express';
export declare const registerController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 *
 * @param req email,otp
 * @param res for success full creating a user
 * @returns  res
 */
export declare const otpVerifyController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refreshTokenController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 *
 * @param req request for get profile user
 * @param res find user from database and return user's profile
 * @returns json
 */
export declare const getMeController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 *
 * @param req logout
 * @param res logout from user's device
 * @returns  logout
 */
export declare const logoutController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 *
 * @param req request for logout  from all device
 * @param res if success logout from all device
 * @returns logout from all device
 */
export declare const logOutAllController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const forgetPasswordController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const forgetPasswordOtpController: () => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map