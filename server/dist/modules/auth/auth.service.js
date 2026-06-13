"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.otpEmail = otpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config/config"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.default.APP_EMAIL,
        pass: config_1.default.APP_PASSWORD
    }
});
function generateOtp() {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    return otp;
}
async function otpEmail(email, otp) {
    await transporter.sendMail({
        from: config_1.default.APP_EMAIL,
        to: email,
        subject: 'your otp code is here',
        html: `<h1>${otp}</h1>`
    });
}
//# sourceMappingURL=auth.service.js.map