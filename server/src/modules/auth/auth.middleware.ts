import { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
import config from "../../config/config";
import * as authTypes from './auth.type'


export const authMiddlewareForAuthorization=(req:Request,res:Response,next:NextFunction)=>{
 const token = req.headers.authorization?.split(' ')[1]
 try {
    if(!token){
        return res.status(401).json({
    message:"access denied",
    success:false
    })
}
const decode=jwt.verify(token,config.SECRET_KEY)as authTypes.jwtPayload
(req as any).user=decode
 next()
 } catch (error) {
    return res.status(401).json({
        message:"invalid token or session expired",
        success:false
    })
 }

}

export const authMiddlewareForCookies=(req:Request,res:Response,next:NextFunction)=>{
        const token=req.cookies.refreshToken
    try {
        if(!token){
            return res.status(401).json({message:"access denied",success:false})
        }
            const decode=jwt.verify(token,config.SECRET_KEY)as authTypes.jwtPayload
            ( req as any).user=decode;
            next()
        
    } catch (error) {
        return res.status(401).json({
            message:"invalid token or session expired",
            success:false
        })
    
    }
}