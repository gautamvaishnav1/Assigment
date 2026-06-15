import { Request, Response, NextFunction } from "express";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export const validateProductImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(); // Let controller handle missing file
  }

  const mimeType = req.file.mimetype;
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(mimeType) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed.",
    });
  }

  next();
};
