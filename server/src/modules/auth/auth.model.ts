import mongoose,{ Document, Schema } from "mongoose";

export interface User extends Document{
    email:string,
    password:string,
    name  :string
}

const userSchema=new Schema<User>({
    email:{
        type:String,
        required:[true,'email is required for creating account'],
         unique:[true,'email must be unique ']
    },
    password:{type:String,
        required:true,

    },
    name:{
        type:String,
        required:true
    }
},{timestamps:true})

const userModel= mongoose.model<User>('user',userSchema)

export default userModel;