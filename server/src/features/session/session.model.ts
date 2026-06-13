import mongoose ,{Document,Schema, Types} from "mongoose";

export interface Session extends Document{
    userId:Types.ObjectId;
    revoke?:boolean;
    refreshToken:string;
}

const sessionSchema=new Schema<Session>({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
    revoke:{type:Boolean,default:false},
    refreshToken:{type:String,required:true}
})
const sessionModel=mongoose.model<Session>('session',sessionSchema);
export default sessionModel; 