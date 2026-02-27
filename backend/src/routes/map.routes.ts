import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import { redisClient } from '../utils/redis';

const router = Router();
const prisma = new PrismaClient();

router.get('/heatmap', requireAuth, async (req, res, next) => {
    try {
        const cachedHeatmap = await redisClient.get('map:heatmap');
        if (cachedHeatmap) {
            return res.json(JSON.parse(cachedHeatmap));
        }

        const assessments = await prisma.assessment.findMany({
            select: {
                id: true,
                lat: true,
                lng: true,
                severityScore: true,
                damageType: true,
                zoneId: true,
                status: true
            }
        });

        const geoJSON = {
            type: 'FeatureCollection',
            features: assessments.map(a => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
                properties: {
                    id: a.id,
                    severityScore: a.severityScore,
                    damageType: a.damageType,
                    zoneId: a.zoneId,
                    status: a.status
                }
            }))
        };

        // Cache for 30 seconds
        await redisClient.setex('map:heatmap', 30, JSON.stringify(geoJSON));

        res.json(geoJSON);
    } catch (err) {
        next(err);
    }
});

export default router;
