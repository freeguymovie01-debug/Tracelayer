"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = require("../prisma/client");
const alert_service_1 = require("./alert.service");
class AnalyticsService {
    static async getSummary() {
        const cacheKey = 'analytics:summary';
        const cached = await alert_service_1.redisCache.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const totalAssessments = await client_1.prisma.assessment.count();
        const low = await client_1.prisma.assessment.count({ where: { severityScore: { lte: 30 } } });
        const medium = await client_1.prisma.assessment.count({ where: { severityScore: { gt: 30, lte: 70 } } });
        const high = await client_1.prisma.assessment.count({ where: { severityScore: { gt: 70, lte: 90 } } });
        const critical = await client_1.prisma.assessment.count({ where: { severityScore: { gt: 90 } } });
        const top5CriticalZonesRaw = await client_1.prisma.assessment.groupBy({
            by: ['zoneId'],
            _avg: {
                severityScore: true,
            },
            orderBy: {
                _avg: {
                    severityScore: 'desc'
                }
            },
            take: 5
        });
        // Resolve Zone Names
        const top5CriticalZones = await Promise.all(top5CriticalZonesRaw.map(async (z) => {
            const zone = await client_1.prisma.zone.findUnique({ where: { id: z.zoneId }, select: { name: true } });
            return {
                zoneId: z.zoneId,
                zoneName: zone?.name || 'Unknown',
                avgSeverity: z._avg.severityScore
            };
        }));
        const structuresByTypeRaw = await client_1.prisma.assessment.groupBy({
            by: ['damageType'],
            _count: { _all: true }
        });
        const structuresByType = structuresByTypeRaw.reduce((acc, curr) => {
            acc[curr.damageType] = curr._count._all;
            return acc;
        }, {});
        const summary = {
            totalAssessments,
            severityBreakdown: { low, medium, high, critical },
            top5CriticalZones,
            structuresByType
        };
        // TTL 60s
        await alert_service_1.redisCache.set(cacheKey, JSON.stringify(summary), 'EX', 60);
        return summary;
    }
    static async getHeatmap() {
        const cacheKey = 'map:heatmap';
        const cached = await alert_service_1.redisCache.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const assessments = await client_1.prisma.assessment.findMany({
            select: {
                id: true,
                lat: true,
                lng: true,
                severityScore: true,
                damageType: true
            }
        });
        const geojson = {
            type: 'FeatureCollection',
            features: assessments.map(a => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [a.lng, a.lat] // GeoJSON requires [longitude, latitude]
                },
                properties: {
                    id: a.id,
                    severityScore: a.severityScore,
                    damageType: a.damageType
                }
            }))
        };
        // TTL 30s
        await alert_service_1.redisCache.set(cacheKey, JSON.stringify(geojson), 'EX', 30);
        return geojson;
    }
    static async invalidateMapCache() {
        await alert_service_1.redisCache.del('map:heatmap');
        await alert_service_1.redisCache.del('analytics:summary');
    }
}
exports.AnalyticsService = AnalyticsService;
