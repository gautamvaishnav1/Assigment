import nodemailer from 'nodemailer'
import config from '../../config/config'

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:config.APP_EMAIL,
        pass:config.APP_PASSWORD
    }
})

 export function generateOtp():string{
    const otp=Math.floor(10000+Math.random()*90000).toString()
    return otp

}
export async function otpEmail (email:string,otp:string){
    await transporter.sendMail({
        from:config.APP_EMAIL,
        to:email,
        subject:'your otp code is here',
        html:
        `<h1>${otp}</h1>`
    })

}