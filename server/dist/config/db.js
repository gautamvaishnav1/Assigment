"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const connectToDB = async () => {
    try {
        await mongoose_1.default.connect(config_1.default.MONGO_URI);
        console.log('mongo connected');
    }
    catch (error) {
        console.log('mongo not connected');
        console.log(error);
        process.exit(1);
    }
};
exports.connectToDB = connectToDB;
//# sourceMappingURL=db.js.map