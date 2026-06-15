import express from 'express'
import * as productController from './product.controller'
import { productValidator } from './product.validator'
import { upload } from '../../shared/multer.middleware'
import { authMiddlewareForAuthorization } from '../../modules/auth/auth.middleware'
import { validateProductImage } from './prouct.middleware'

const productRouter = express.Router()

// Add Product (requires auth + image upload + validation)
productRouter.post(
  '/add-product',
  authMiddlewareForAuthorization,
  upload.single('productImage'),
  validateProductImage,
  productValidator,
  productController.addProductController
)

// Edit Product (requires auth + optional image upload)
productRouter.patch(
  '/edit-product/:id',
  authMiddlewareForAuthorization,
  upload.single('productImage'),
  validateProductImage,
  productController.editProductController
)

// Delete Product (requires auth)
productRouter.delete(
  '/delete-product/:id',
  authMiddlewareForAuthorization,
  productController.deletProductController
)

// Get All Published Products (public)
productRouter.get(
  '/get-all-product',
  productController.getAllProductController
)

// Get Single Product by ID (public)
productRouter.get(
  '/get-single-product/:id',
  productController.getSingleProductController
)

// Get My Products (requires auth)
productRouter.get(
  '/my-products',
  authMiddlewareForAuthorization,
  productController.getMyProductsController
)

export default productRouter