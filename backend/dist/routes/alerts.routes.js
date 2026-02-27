"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const [data, total] = await Promise.all([
            prisma.alert.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { zone: true }
            }),
            prisma.alert.count()
        ]);
        res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        next(err);
    }
});
router.get('/active', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        // As we lack AlertStatus, we consider alerts 'active' if they are < 24 hrs old
        const data = await prisma.alert.findMany({
            where: { createdAt: { gte: oneDayAgo } },
            orderBy: { createdAt: 'desc' },
            include: { zone: true }
        });
        res.json({ data, total: data.length });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
