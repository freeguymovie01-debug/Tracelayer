import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /alerts?limit=20
 * INTEGRATION NOTE FOR FE1:
 *   - Poll this on mount + listen to 'alertFired' Socket.io event
 *   - Use createdAt to show "X minutes ago" timestamp
 *   - severityScore >= 90 → red badge, >= 70 → orange badge
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const alerts = await prisma.alert.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                zone: { select: { id: true, name: true, lat: true, lng: true } },
                assessment: { select: { id: true, damageType: true, status: true } }
            }
        });
        res.json({ data: alerts, total: alerts.length });
    } catch (err) {
        console.error('alerts route error:', err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

/**
 * GET /alerts/active
 * Returns alerts from last 6 hours — used for dashboard notification bell count
 */
router.get('/active', requireAuth, async (_req: Request, res: Response) => {
    try {
        const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const alerts = await prisma.alert.findMany({
            where: { createdAt: { gte: since } },
            orderBy: { createdAt: 'desc' },
            include: {
                zone: { select: { id: true, name: true } }
            }
        });
        res.json({ data: alerts, total: alerts.length, since: since.toISOString() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch active alerts' });
    }
});

export default router;
