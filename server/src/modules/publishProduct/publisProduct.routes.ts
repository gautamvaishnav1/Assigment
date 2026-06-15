import express from 'express';
import * as publishProductController from './publishProduct.controller';
import { authMiddlewareForAuthorization } from '../../modules/auth/auth.middleware';

const router = express.Router();
router.post('/publish-product', authMiddlewareForAuthorization, publishProductController.publishProductController);
router.post('/unpublish-product', authMiddlewareForAuthorization, publishProductController.unpublishProductController);
router.get('/get-published-products', authMiddlewareForAuthorization,publishProductController.getPublishedProductsController);
router.get('/get-unpublished-products', authMiddlewareForAuthorization, publishProductController.getUnpublishedProductsController);
export default router;