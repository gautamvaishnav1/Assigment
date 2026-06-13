import Redis from "ioredis";
import config from "./config";

const redis =new Redis(config.REDIS_URL)

redis.on('connect',(c:any)=>{
    console.log('redis connected',c)
})
redis.on('error',(err)=>{
console.log('redis not connected',err)
})
export default redis