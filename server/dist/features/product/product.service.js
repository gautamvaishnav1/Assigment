"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodejs_1 = __importDefault(require("@imagekit/nodejs"));
const config_1 = __importDefault(require("../../config/config"));
const imageKit = new nodejs_1.default({
    privateKey: config_1.default.IMAGEKIT_PRIVATEKEY,
    //   publicKey: config.IMAGEKIT_PUBLICKEY,
    //   urlEndpoint: config.IMAGEKIT_URLENDPOINT,
});
// export const uploadFile = async (
//   file: Buffer | string,
//   fileName: string
// ) => {
//   const result = await imageKit.upload({
//     file,
//     fileName,
//   });
//   return result;
// };
//# sourceMappingURL=product.service.js.map