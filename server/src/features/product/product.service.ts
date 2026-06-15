import ImageKit from "imagekit";
import config from "../../config/config";

const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLICKEY,
  privateKey: config.IMAGEKIT_PRIVATEKEY,
  urlEndpoint: config.IMAGEKIT_URLENDPOINT,
});

class ImageKitService {
  async uploadImage(
    file: Buffer,
    fileName: string,
    folder = "/products"
  ) {
    try {
      const result = await imagekit.upload({
        file,
        fileName,
        folder,
        useUniqueFileName: true,
      });

      return {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
      };
    } catch (error) {
      console.error("ImageKit upload error:", error);
      throw new Error("Failed to upload image to ImageKit");
    }
  }

  async deleteImage(fileId: string) {
    try {
      await imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error("ImageKit delete error:", error);
      throw new Error("Failed to delete image from ImageKit");
    }
  }
}

export default new ImageKitService();