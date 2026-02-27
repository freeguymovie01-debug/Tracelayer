import Redis from 'ioredis';
import { env } from '../config/env';

export const redisClient = new Redis(env.REDIS_URL);
export const redisSubscriber = new Redis(env.REDIS_URL);

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected matching env URI.'));
