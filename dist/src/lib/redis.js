"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const client_1 = require("@redis/client");
exports.redis = (0, client_1.createClient)({
    url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD,
});
exports.redis.connect().catch(console.error);
