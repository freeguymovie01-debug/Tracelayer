"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const redis_1 = require("../utils/redis");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/heatmap', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const cachedHeatmap = await redis_1.redisClient.get('map:heatmap');
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
        await redis_1.redisClient.setex('map:heatmap', 30, JSON.stringify(geoJSON));
        res.json(geoJSON);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
