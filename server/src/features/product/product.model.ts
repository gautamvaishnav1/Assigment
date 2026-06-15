import mongoose,{ Document, Schema, Types } from "mongoose";

export interface Product extends Document{
  productName:string;
  productType:string;
  brandName:string
    userId:Types.ObjectId;
    quantityStock:number;
    sellingPrice:number;
    mrp:number;
    productImage:string;
    exchange:boolean;
    isPublished?:boolean;
}

const productSchema=new Schema<Product>({
    productName:{
        type:String,
        required:true
    },
    productType:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    sellingPrice:{
        type:Number,
        required:true,
        min:0
    },
    mrp:{
        type:Number,
        required:true,
        min:0
    },
    productImage:{
        type:String,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    brandName:{
        type:String,
        required:true
    },
  
    exchange:{
        type:Boolean,
        required:true

    },
    quantityStock:{
        type:Number,
        min:0,
        required:true},
   
},{timestamps:true})

const productModel= mongoose.model<Product>('product',productSchema)

export default productModel;