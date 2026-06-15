
import cors from 'cors'
import express from "express";
import helmet from 'helmet'
// import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import dotenv from 'dotenv'
dotenv.config() 
// import redis from './config/redis';
import cookieParser from 'cookie-parser'
// Router 
import authRouter from './modules/auth/auth.routes'
import productRouter from './features/product/product.routes'
import publishProductRouter from './modules/publishProduct/publisProduct.routes'
import { registerPublicMiddleware } from './public-middleware'

const app = express()

const allowedOrigins = [
  '*',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods:["GET",'POST','PUT','PATCH','DELETE'],
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
app.use('/api/product', productRouter)
app.use('/api/publish',publishProductRouter )

// Serve React production build (fixes MIME type issues for module scripts)
registerPublicMiddleware(app)

export default app


