import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export class AuthService {
    static async register(data: { email: string; password: string; name: string; role?: Role }) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || 'ASSESSOR',
            },
        });

        const token = this.generateToken(user.id, user.role);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }

    static async login(data: { email: string; password: string }) {
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user.id, user.role);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }

    private static generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '1d' });
    }
}
