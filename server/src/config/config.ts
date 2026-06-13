import dotenv from 'dotenv'
dotenv.config()
if (!process.env.PORT) {
  throw new Error('PORT is not found')
}
if (!process.env.MONGO_URI) {
  throw new Error('Mongo uri not found')
}
if (!process.env.SECRET_KEY) {
  throw new Error('Secret key is not found ')
}
if(!process.env.REDIS_URL){
  throw new Error('Redis url not found')
}
if(!process.env.APP_PASSWORD){
  throw new Error('App password not found')
}
if(!process.env.APP_EMAIL){
  throw new Error('Sender email not found')
}
if(!process.env.IMAGEKIT_PRIVATEKEY){
  throw new Error('Imagekit private key not found')
}
if(!process.env.IMAGEKIT_PUBLICKEY){
  throw new Error('Imagekit public key not found')
}
if(!process.env.IMAGEKIT_URLENDPOINT){
  throw new Error('Imagekit url endpoint not found')
}
// if(!process.env.REDIS_PORT){
//   throw new Error('Redis port not found')
// }
const config = {
  MONGO_URI: String(process.env.MONGO_URI),
  SECRET_KEY: String(process.env.SECRET_KEY),
  PORT: Number(process.env.PORT),
  REDIS_URL:String(process.env.REDIS_URL),
  APP_PASSWORD:String(process.env.APP_PASSWORD),
  APP_EMAIL:String(process.env.APP_EMAIL),
  IMAGEKIT_PRIVATEKEY:String(process.env.PRIVATE_KEY),
  IMAGEKIT_PUBLICKEY:String(process.env.PUBLIC_KEY),
  IMAGEKIT_URLENDPOINT:String(process.env.URL_ENDPOINT)
}

export default config
