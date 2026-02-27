import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, AssessmentStatus, Role } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { calculateSeverityScore } from '../utils/severity';
import { redisClient } from '../utils/redis';

const router = Router();
const prisma = new PrismaClient();

const createAssessmentSchema = z.object({
    zoneId: z.string(),
    lat: z.number(),
    lng: z.number(),
    damageType: z.string(),
    structureDamage: z.number().min(0).max(100),
    damageSeverity: z.number().min(0).max(100),
    personsDamage: z.number().min(0).max(100),
    infraDamage: z.number().min(0).max(100),
    peopleAffected: z.number().optional(),
    aiConfidence: z.number().optional(),
    photoUrl: z.string().optional(),
    notes: z.string().optional()
});

router.get('/stats/overview', requireAuth, async (req, res, next) => {
    try {
        const total = await prisma.assessment.count();
        const pending = await prisma.assessment.count({ where: { status: 'PENDING' } });
        const verified = await prisma.assessment.count({ where: { status: 'VERIFIED' } });
        const rejected = await prisma.assessment.count({ where: { status: 'REJECTED' } });

        res.json({ total, pending, verified, rejected });
    } catch (err) {
        next(err);
    }
});

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (req.user!.role === Role.ASSESSOR) {
            where.userId = req.user!.id;
        }
        if (req.query.zone) where.zoneId = req.query.zone;
        if (req.query.status) where.status = req.query.status;
        if (req.query.severity) {
            const sev = req.query.severity as string;
            if (sev === 'low') where.severityScore = { lt: 35 };
            else if (sev === 'medium') where.severityScore = { gte: 35, lt: 60 };
            else if (sev === 'high') where.severityScore = { gte: 60, lt: 80 };
            else if (sev === 'critical') where.severityScore = { gte: 80 };
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
    } catch (err) {
        next(err);
    }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { id: req.params.id },
            include: { zone: true, user: { select: { id: true, name: true, email: true, role: true } } }
        });
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        if (req.user!.role === Role.ASSESSOR && assessment.userId !== req.user!.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(assessment);
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const data = createAssessmentSchema.parse(req.body);
        const severityScore = calculateSeverityScore({
            structureDamage: data.structureDamage,
            damageSeverity: data.damageSeverity,
            personsDamage: data.personsDamage,
            infraDamage: data.infraDamage
        });

        const assessment = await prisma.assessment.create({
            data: {
                zoneId: data.zoneId,
                userId: req.user!.id,
                lat: data.lat,
                lng: data.lng,
                damageType: data.damageType,
                severityScore,
                structureDamage: data.structureDamage,
                personsDamage: data.personsDamage,
                infraDamage: data.infraDamage,
                peopleAffected: data.peopleAffected ?? 0,
                aiConfidence: data.aiConfidence,
                photoUrl: data.photoUrl,
                notes: data.notes
            }
        });

        await redisClient.del('map:heatmap');
        await redisClient.del('analytics:summary');
        redisClient.publish('ASSESSMENT_CREATED', JSON.stringify(assessment));
        res.status(201).json(assessment);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/verify', requireAuth, requireRole(Role.ADMIN, Role.SUPERVISOR), async (req, res, next) => {
    try {
        const { status } = z.object({ status: z.enum([AssessmentStatus.VERIFIED, AssessmentStatus.REJECTED]) }).parse(req.body);

        const assessment = await prisma.assessment.update({
            where: { id: req.params.id },
            data: { status }
        });

        res.json(assessment);
    } catch (err) {
        next(err);
    }
});
router.patch('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const assessment = await prisma.assessment.findUnique({ where: { id: req.params.id } });
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        if (req.user!.role === Role.ASSESSOR && assessment.userId !== req.user!.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (req.user!.role === Role.ASSESSOR && assessment.status !== AssessmentStatus.REJECTED) {
            return res.status(403).json({ error: 'Assessors can only edit flagged (rejected) assessments' });
        }

        const dataToUpdate: any = {};
        if (req.body.notes !== undefined) dataToUpdate.notes = req.body.notes;
        if (req.body.peopleAffected !== undefined) dataToUpdate.peopleAffected = req.body.peopleAffected;
        if (req.body.damageType !== undefined) dataToUpdate.damageType = req.body.damageType;

        // Reset to pending if edited by assessor
        if (req.user!.role === Role.ASSESSOR) {
            dataToUpdate.status = AssessmentStatus.PENDING;
        }

        const updated = await prisma.assessment.update({
            where: { id: req.params.id },
            data: dataToUpdate
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
});

export default router;
