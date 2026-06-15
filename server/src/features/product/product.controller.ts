import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import productModel from './product.model';
import ImageKitService from './product.service';

export const addProductController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required',
      });
    }

    const { productName, productType, brandName, quantityStock, sellingPrice, mrp, exchange } = req.body;
    const userId = (req as any).user.id; // From authMiddleware

    // Upload to ImageKit
    const image = await ImageKitService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );

    const newProduct = await productModel.create({
      productName,
      productType,
      brandName,
      userId,
      quantityStock: Number(quantityStock),
      sellingPrice: Number(sellingPrice),
      mrp: Number(mrp),
      exchange: exchange === 'true' || exchange === true,
      productImage: image.url,
     
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

export const editProductController = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id as string;
    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    const product = await productModel.findOne({ _id: id, userId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }

    if (updateData.quantityStock) updateData.quantityStock = Number(updateData.quantityStock);
    if (updateData.sellingPrice) updateData.sellingPrice = Number(updateData.sellingPrice);
    if (updateData.mrp) updateData.mrp = Number(updateData.mrp);
    if (updateData.exchange !== undefined) updateData.exchange = updateData.exchange === 'true' || updateData.exchange === true;

    if (req.file) {
      const image = await ImageKitService.uploadImage(
        req.file.buffer,
        req.file.originalname
      );
      updateData.productImage = image.url;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

export const deletProductController = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id as string;
    const userId = (req as any).user.id;

    const product = await productModel.findOneAndDelete({ _id: id, userId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

export const getAllProductController = async (req: Request, res: Response) => {
  try {
    const products = await productModel.find({ isPublished: true }).populate('userId', 'name email');
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

export const getSingleProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id).populate('userId', 'name email');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

export const getMyProductsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const products = await productModel.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your products',
      error: error.message,
    });
  }
};