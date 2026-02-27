import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('[Global Error]', err);

    if (err instanceof ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Unique constraint violation' });
        }
    }

    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
