"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlewareForCookies = exports.authMiddlewareForAuthorization = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config/config"));
const authMiddlewareForAuthorization = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            return res.status(401).json({
                message: "access denied",
                success: false
            });
        }
        const decode = jsonwebtoken_1.default.verify(token, config_1.default.SECRET_KEY);
        req.user = decode;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "invalid token or session expired",
            success: false
        });
    }
};
exports.authMiddlewareForAuthorization = authMiddlewareForAuthorization;
const authMiddlewareForCookies = (req, res, next) => {
    const token = req.cookies.refreshToken;
    try {
        if (!token) {
            return res.status(401).json({ message: "access denied", success: false });
        }
        const decode = jsonwebtoken_1.default.verify(token, config_1.default.SECRET_KEY);
        req.user = decode;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "invalid token or session expired",
            success: false
        });
    }
};
exports.authMiddlewareForCookies = authMiddlewareForCookies;
//# sourceMappingURL=auth.middleware.js.map