import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import { redisClient } from '../utils/redis';

const router = Router();
const prisma = new PrismaClient();

router.get('/summary', requireAuth, async (req: Request, res: Response, next) => {
    try {
        const CACHE_KEY = 'analytics:summary';
        const CACHE_TTL = 60;

        const cached = await redisClient.get(CACHE_KEY);
        if (cached) return res.json(JSON.parse(cached));

        const [totalAssessments, pendingVerification, recentAlerts] = await Promise.all([
            prisma.assessment.count(),
            prisma.assessment.count({ where: { status: 'PENDING' } }),
            prisma.alert.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
        ]);

        const assessments = await prisma.assessment.findMany({ select: { severityScore: true, createdAt: true, zoneId: true, zone: { select: { name: true } } } });

        const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        let last24h = 0;
        let previous24h = 0;

        const zoneStats: Record<string, { count: number; sumSeq: number; name: string }> = {};

        for (const a of assessments) {
            if (a.severityScore >= 80) severityBreakdown.critical++;
            else if (a.severityScore >= 60) severityBreakdown.high++;
            else if (a.severityScore >= 35) severityBreakdown.medium++;
            else severityBreakdown.low++;

            if (a.createdAt >= oneDayAgo) last24h++;
            else if (a.createdAt >= twoDaysAgo && a.createdAt < oneDayAgo) previous24h++;

            if (!zoneStats[a.zoneId]) {
                zoneStats[a.zoneId] = { count: 0, sumSeq: 0, name: a.zone.name };
            }
            zoneStats[a.zoneId].count++;
            zoneStats[a.zoneId].sumSeq += a.severityScore;
        }

        const top5CriticalZones = Object.entries(zoneStats)
            .map(([zoneId, stats]) => ({
                zoneId,
                zoneName: stats.name,
                avgSeverity: stats.count ? stats.sumSeq / stats.count : 0,
                count: stats.count
            }))
            .sort((a, b) => b.avgSeverity - a.avgSeverity)
            .slice(0, 5);

        const summaryData = {
            totalAssessments,
            pendingVerification,
            severityBreakdown,
            top5CriticalZones,
            recentAlerts,
            trend: { last24h, previous24h }
        };

        await redisClient.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(summaryData));
        res.json(summaryData);
    } catch (err) {
        next(err);
    }
});

router.get('/zones', requireAuth, async (req: Request, res: Response, next) => {
    try {
        const zones = await prisma.zone.findMany({
            include: {
                _count: {
                    select: { assessments: true, alerts: true }
                }
            }
        });

        const result = zones.map((z: any) => ({
            id: z.id,
            name: z.name,
            totalAssessments: z._count.assessments,
            totalAlerts: z._count.alerts
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
