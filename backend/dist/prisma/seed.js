"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // 1. Create Users
    const password = await bcryptjs_1.default.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dda.local' },
        update: {},
        create: { email: 'admin@dda.local', name: 'Admin User', password, role: client_1.Role.ADMIN },
    });
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@dda.local' },
        update: {},
        create: { email: 'supervisor@dda.local', name: 'Supervisor User', password, role: client_1.Role.SUPERVISOR },
    });
    const assessor = await prisma.user.upsert({
        where: { email: 'assessor@dda.local' },
        update: {},
        create: { email: 'assessor@dda.local', name: 'Field Assessor', password, role: client_1.Role.ASSESSOR },
    });
    console.log('✅ Users created.');
    // 2. Create Zones
    const zonesToCreate = [
        { name: 'North District', lat: 34.0522, lng: -118.2437, description: 'Mountainous area' },
        { name: 'South Bay', lat: 33.8358, lng: -118.3406, description: 'Coastal region' },
        { name: 'East Valley', lat: 34.1856, lng: -118.3090, description: 'Urban sprawl' }
    ];
    const zones = [];
    for (const z of zonesToCreate) {
        const existing = await prisma.zone.findFirst({ where: { name: z.name } });
        if (!existing) {
            zones.push(await prisma.zone.create({ data: z }));
        }
        else {
            zones.push(existing);
        }
    }
    console.log(`✅ ${zones.length} Zones created.`);
    // 3. Create Assessments (~20)
    const users = [admin, supervisor, assessor];
    const classes = ['low', 'medium', 'high', 'critical'];
    let highSeverityCount = 0;
    for (let i = 0; i < 20; i++) {
        const zone = zones[i % zones.length];
        const user = users[i % users.length];
        // Mix severities
        let structureDamage = Math.floor(Math.random() * 100);
        let severity = Math.floor(Math.random() * 100);
        let personsDamage = Math.floor(Math.random() * 100);
        let infraDamage = Math.floor(Math.random() * 100);
        // Force at least 5 criticals
        if (highSeverityCount < 5) {
            structureDamage = 90 + Math.random() * 10;
            severity = 90 + Math.random() * 10;
            personsDamage = 90 + Math.random() * 10;
            infraDamage = 90 + Math.random() * 10;
        }
        const severityScore = (structureDamage * 0.30) + (severity * 0.35) + (personsDamage * 0.20) + (infraDamage * 0.15);
        if (severityScore > 70)
            highSeverityCount++;
        const assessment = await prisma.assessment.create({
            data: {
                zoneId: zone.id,
                userId: user.id,
                lat: zone.lat + (Math.random() * 0.01),
                lng: zone.lng + (Math.random() * 0.01),
                damageType: classes[Math.floor(Math.random() * classes.length)],
                severityScore,
                structureDamage,
                personsDamage,
                infraDamage,
                photoUrl: `/uploads/sample-${i}.jpg`,
                notes: `Sample assessment ${i} for area ${zone.name}`,
                status: severityScore > 70 ? 'VERIFIED' : 'PENDING'
            }
        });
        // 4. Create Pre-fired Alerts
        if (severityScore > 70) {
            await prisma.alert.create({
                data: {
                    assessmentId: assessment.id,
                    zoneId: zone.id,
                    severityScore,
                    message: `SEED ALERT: High severity damage reported in zone ${zone.name} (Score: ${severityScore.toFixed(2)})`
                }
            });
        }
    }
    console.log(`✅ Assessments and Alerts generated.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
