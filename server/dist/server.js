"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const db_1 = require("./config/db");
require("../src/config/redis");
(0, db_1.connectToDB)();
app_1.default.listen(config_1.default.PORT, '0.0.0.0', () => {
    console.log(`your port is running  on ${config_1.default.PORT}`);
});
//# sourceMappingURL=server.js.map