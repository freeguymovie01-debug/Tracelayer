"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/summary', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const aggregates = await prisma.assessment.aggregate({
            _count: { id: true },
            _avg: { severityScore: true }
        });
        const statusCounts = await prisma.assessment.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        const byStatus = statusCounts.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {});
        res.json({
            totalReports: aggregates._count.id,
            averageSeverity: aggregates._avg.severityScore || 0,
            breakdown: byStatus
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/zones', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const zones = await prisma.zone.findMany({
            include: {
                _count: {
                    select: { assessments: true, alerts: true }
                }
            }
        });
        const result = zones.map((z) => ({
            id: z.id,
            name: z.name,
            totalAssessments: z._count.assessments,
            totalAlerts: z._count.alerts
        }));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
