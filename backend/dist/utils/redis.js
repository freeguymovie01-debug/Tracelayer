"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSubscriber = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
exports.redisClient = new ioredis_1.default(env_1.env.REDIS_URL);
exports.redisSubscriber = new ioredis_1.default(env_1.env.REDIS_URL);
exports.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
exports.redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
exports.redisClient.on('connect', () => console.log('✅ Redis connected matching env URI.'));
