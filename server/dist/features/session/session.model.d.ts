import mongoose, { Document, Types } from "mongoose";
export interface Session extends Document {
    userId: Types.ObjectId;
    revoke?: boolean;
    refreshToken: string;
}
declare const sessionModel: mongoose.Model<Session, {}, {}, {}, mongoose.Document<unknown, {}, Session, {}, mongoose.DefaultSchemaOptions> & Session & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Session>;
export default sessionModel;
//# sourceMappingURL=session.model.d.ts.map