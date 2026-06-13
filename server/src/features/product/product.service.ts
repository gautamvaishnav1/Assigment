import ImageKit from "@imagekit/nodejs";
import config from "../../config/config";

const imageKit = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATEKEY,
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