"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Router 
const auth_routes_1 = __importDefault(require("../src/modules/auth/auth.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ["GET", 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('combined'));
// app.use(rateLimiterMiddleWare)
app.use((0, helmet_1.default)());
// app.use(rateLimit())
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
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
exports.default = app;
//# sourceMappingURL=app.js.map