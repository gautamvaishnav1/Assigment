import { Types } from "mongoose";

export interface CreateProductBody {
  productName: string;
  productType: string;
  brandName: string;
  quantityStock: number;
  sellingPrice: number;
  mrp: number;
  exchange: boolean;
}

export interface UpdateProductBody extends Partial<CreateProductBody> {}

export interface ProductResponse {
  _id: string;
  productName: string;
  productType: string;
  brandName: string;
  userId: Types.ObjectId;
  quantityStock: number;
  sellingPrice: number;
  mrp: number;
  productImage: string;
  exchange: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
