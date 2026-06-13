"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("./config"));
const redis = new ioredis_1.default(config_1.default.REDIS_URL);
redis.on('connect', (c) => {
    console.log('redis connected', c);
});
redis.on('error', (err) => {
    console.log('redis not connected', err);
});
exports.default = redis;
//# sourceMappingURL=redis.js.map