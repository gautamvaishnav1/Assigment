import { Request, Response } from 'express';
import productModel from '../../features/product/product.model';
// import productModel from '../features/product/product.model';



export const publishProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const userId = (req as any).user.id;

    const product = await productModel.findOne({ _id: id, userId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }
    product.isPublished = true;
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product published successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to publish product',
      error: error.message,
    });
  }};
  export const unpublishProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const userId = (req as any).user.id;    

        const product = await productModel.findOne({ _id: id, userId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }
    product.isPublished = false;
    await product.save();
    return res.status(200).json({
      success: true,
      message: 'Product unpublished successfully',
    });
  } catch (error: any) {    
    return res.status(500).json({
      success: false,
      message: 'Failed to unpublish product',
      error: error.message,
    });
  
  }}

  export const getPublishedProductsController = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
        const products = await productModel.find({ userId, isPublished: true });
        return res.status(200).json({
          success: true,
          products,
        });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch published products',
        error: error.message,
      });
    }
    };

    export const getUnpublishedProductsController = async (req: Request, res: Response) => {    
        try {
            const userId = (req as any).user.id;
            const products = await productModel.find({ userId, isPublished: false });
            return res.status(200).json({
                success: true,
                products,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch unpublished products',
                error: error.message,
            });
        }
    
    }