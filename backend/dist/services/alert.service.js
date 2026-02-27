"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNewAssessment = processNewAssessment;
const client_1 = require("@prisma/client");
const socket_gateway_1 = require("../ws/socket.gateway");
const prisma = new client_1.PrismaClient();
// In a real application, you might do advanced geospatial or historical checks.
// For the hackathon, we create an alert if severityScore > 75.
async function processNewAssessment(assessment) {
    try {
        if (assessment.severityScore >= 75) {
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
            (0, socket_gateway_1.emitAlertFired)({
                alertId: alert.id,
                zoneId: alert.zoneId,
                zoneName,
                severityScore: assessment.severityScore,
                message: alert.message,
                timestamp: alert.createdAt
            });
        }
    }
    catch (error) {
        console.error('Error processing assessment for alerts:', error);
    }
}
