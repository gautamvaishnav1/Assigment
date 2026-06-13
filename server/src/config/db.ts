import mongoose from "mongoose";
import config from "./config";


export const connectToDB = async():Promise<void>=>{
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log('mongo connected')
    } catch (error) {
        console.log('mongo not connected')
        console.log(error)

        process.exit(1);
    }
}