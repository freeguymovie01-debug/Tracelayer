"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("../prisma/client");
const env_1 = require("../config/env");
class AuthService {
    static async register(data) {
        const existingUser = await client_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await client_1.prisma.user.create({
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
    static async login(data) {
        const user = await client_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user.id, user.role);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
    static generateToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_SECRET, { expiresIn: '1d' });
    }
}
exports.AuthService = AuthService;
