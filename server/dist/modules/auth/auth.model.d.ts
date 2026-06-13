import mongoose, { Document } from "mongoose";
export interface User extends Document {
    email: string;
    password: string;
    name: string;
}
declare const userModel: mongoose.Model<User, {}, {}, {}, mongoose.Document<unknown, {}, User, {}, mongoose.DefaultSchemaOptions> & User & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, User>;
export default userModel;
//# sourceMappingURL=auth.model.d.ts.map