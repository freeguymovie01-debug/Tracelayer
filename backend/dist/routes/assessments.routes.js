"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const severity_1 = require("../utils/severity");
const redis_1 = require("../utils/redis");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const createAssessmentSchema = zod_1.z.object({
    zoneId: zod_1.z.string(),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    damageType: zod_1.z.string(),
    structureDamage: zod_1.z.number().min(0).max(100),
    damageSeverity: zod_1.z.number().min(0).max(100),
    personsDamage: zod_1.z.number().min(0).max(100),
    infraDamage: zod_1.z.number().min(0).max(100),
    photoUrl: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
router.get('/stats/overview', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const total = await prisma.assessment.count();
        const pending = await prisma.assessment.count({ where: { status: 'PENDING' } });
        const verified = await prisma.assessment.count({ where: { status: 'VERIFIED' } });
        const rejected = await prisma.assessment.count({ where: { status: 'REJECTED' } });
        res.json({ total, pending, verified, rejected });
    }
    catch (err) {
        next(err);
    }
});
router.get('/', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (req.query.zone)
            where.zoneId = req.query.zone;
        if (req.query.status)
            where.status = req.query.status;
        if (req.query.severity) {
            const sev = req.query.severity;
            if (sev === 'low')
                where.severityScore = { lt: 35 };
            else if (sev === 'medium')
                where.severityScore = { gte: 35, lt: 60 };
            else if (sev === 'high')
                where.severityScore = { gte: 60, lt: 80 };
            else if (sev === 'critical')
                where.severityScore = { gte: 80 };
        }
        const [data, total] = await Promise.all([
            prisma.assessment.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { zone: true, user: { select: { name: true, email: true } } }
            }),
            prisma.assessment.count({ where })
        ]);
        res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { id: req.params.id },
            include: { zone: true, user: { select: { id: true, name: true, email: true, role: true } } }
        });
        if (!assessment)
            return res.status(404).json({ error: 'Assessment not found' });
        res.json(assessment);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const data = createAssessmentSchema.parse(req.body);
        const severityScore = (0, severity_1.calculateSeverityScore)({
            structureDamage: data.structureDamage,
            damageSeverity: data.damageSeverity,
            personsDamage: data.personsDamage,
            infraDamage: data.infraDamage
        });
        const assessment = await prisma.assessment.create({
            data: {
                zoneId: data.zoneId,
                userId: req.user.id,
                lat: data.lat,
                lng: data.lng,
                damageType: data.damageType,
                severityScore,
                structureDamage: data.structureDamage,
                personsDamage: data.personsDamage,
                infraDamage: data.infraDamage,
                photoUrl: data.photoUrl,
                notes: data.notes
            }
        });
        redis_1.redisClient.publish('ASSESSMENT_CREATED', JSON.stringify(assessment));
        res.status(201).json(assessment);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/verify', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR), async (req, res, next) => {
    try {
        const { status } = zod_1.z.object({ status: zod_1.z.enum([client_1.AssessmentStatus.VERIFIED, client_1.AssessmentStatus.REJECTED]) }).parse(req.body);
        const assessment = await prisma.assessment.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(assessment);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
