import { PrismaClient, Assessment } from '@prisma/client';
import { emitAlertFired } from '../ws/socket.gateway';

const prisma = new PrismaClient();

// In a real application, you might do advanced geospatial or historical checks.
// Alert thresholds
// Threshold: 70+ = HIGH alert, 80+ = URGENT, 90+ = CRITICAL
const ALERT_THRESHOLD = 70;

export async function processNewAssessment(assessment: Assessment) {
    try {
        if (assessment.severityScore >= ALERT_THRESHOLD) {
            const zone = await prisma.zone.findUnique({ where: { id: assessment.zoneId } });
            const zoneName = zone ? zone.name : 'Unknown Zone';

            const alertStr = `CRITICAL: High severity (${assessment.severityScore}) damage reported in ${zoneName}.`;

            const alert = await prisma.alert.create({
                data: {
                    assessmentId: assessment.id,
                    zoneId: assessment.zoneId,
                    severityScore: assessment.severityScore,
                    message: alertStr
                }
            });

            console.log(`🚨 ALERT TRIGGERED: ${alertStr}`);

            // Broadcast to all connected clients
            emitAlertFired({
                alertId: alert.id,
                zoneId: alert.zoneId,
                zoneName,
                severityScore: assessment.severityScore,
                message: alert.message,
                timestamp: alert.createdAt
            });
        }
    } catch (error) {
        console.error('Error processing assessment for alerts:', error);
    }
}
