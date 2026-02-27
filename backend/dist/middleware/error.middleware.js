"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
function errorMiddleware(err, req, res, next) {
    console.error('[Global Error]', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Unique constraint violation' });
        }
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
