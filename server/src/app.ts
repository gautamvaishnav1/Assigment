
import cors from 'cors'
import  express  from "express";
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import redis from './config/redis';
import cookieParser from 'cookie-parser'
// Router 
import  authRouter from '../src/modules/auth/auth.routes'

const app=express()
app.use(cors({
    origin:'http://localhost:5173',
    methods:["GET",'POST','PUT','PATCH','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
    credentials:true   

}));
app.use(express.json())
app.use(cookieParser())
app.use(morgan('combined'))

// app.use(rateLimiterMiddleWare)
app.use(helmet())
// app.use(rateLimit())
app.use(express.json())
app.use('/api/auth',authRouter)

// const Banner_key='app:banner';
// function otpKey (phone:number ){
//     return `otp:${phone}`
// }

// app.post('/otp',async(req:Request,res:Response)=>{
//     const {phone}=req.body
//     const otp=Math.floor(100000+Math.random()*900000).toString();
//     await redis.set(otpKey(phone),otp,'EX',30)
//     res.json({message:'otp sent successfully',otp})

// })

// app.post('/otp/verify',async(req:Request,res:Response)=>{
//     const {phone,otp}=req.body
//         const savedOtp=await redis.get(otpKey(phone))
//         if(!savedOtp){
//             return res.status(400).json({
//                 message:'Otp expired'
//             })
//         }
//         if(otp!==savedOtp){
//             return res.status(400).json({
//                 message:"otp invalid"
//             })
//         }
//         await redis.del(otpKey(phone))
//         res.status(200).json({
//             success:true,
//             message:'otp verified'
//         })
// })
// app.get('/otp/:phone/ttl',async(req,res)=>{
//     const ttl=await redis.ttl(otpKey(Number(req.params.phone)))
//     res.json({ttl:ttl})

// })
export default app