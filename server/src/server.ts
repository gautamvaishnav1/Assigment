
import app from './app';
import config from './config/config';
import { connectToDB } from './config/db';
import '../src/config/redis'
connectToDB()




app.listen(config.PORT,'0.0.0.0',()=>{
    console.log(`your port is running  on ${config.PORT}`)
})