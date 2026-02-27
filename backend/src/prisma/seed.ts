import { PrismaClient, Role, AssessmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data to avoid unique constraint errors during multiple runs
    await prisma.alert.deleteMany({});
    await prisma.assessment.deleteMany({});
    await prisma.zone.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@dda.com',
            password: hashedPassword,
            role: Role.ADMIN,
        }
    });

    const assessor = await prisma.user.create({
        data: {
            name: 'Field Assessor 1',
            email: 'assessor1@dda.com',
            password: hashedPassword,
            role: Role.ASSESSOR,
        }
    });

    const supervisor = await prisma.user.create({
        data: {
            name: 'Supervisor',
            email: 'super@dda.com',
            password: hashedPassword,
            role: Role.SUPERVISOR,
        }
    });

    console.log(`✅ Created users: ${admin.email}, ${assessor.email}, ${supervisor.email}`);

    // 2. Create Zones
    const zones = await Promise.all([
        prisma.zone.create({ data: { name: 'Zone Alpha', lat: 28.6139, lng: 77.2090, description: 'Downtown high-risk zone' } }),
        prisma.zone.create({ data: { name: 'Zone Bravo', lat: 28.7041, lng: 77.1025, description: 'Flood prone residential' } }),
        prisma.zone.create({ data: { name: 'Zone Charlie', lat: 28.5355, lng: 77.3910, description: 'Heavy machinery and infrastructure' } }),
    ]);
    console.log(`✅ Created ${zones.length} zones`);

    const jitter = (n: number) => n + (Math.random() * 0.01 - 0.005);
    const mockAssessments: any[] = [];

    // Helper to calculate severity
    const calc = (s: number, d: number, p: number, i: number) => Math.round((s * 0.30) + (d * 0.35) + (p * 0.20) + (i * 0.15));

    // 5 Critical
    for (let i = 0; i < 5; i++) {
        mockAssessments.push({
            zoneId: zones[i % 3].id, userId: assessor.id, lat: jitter(zones[i % 3].lat), lng: jitter(zones[i % 3].lng), damageType: 'Structural',
            structureDamage: 90, personsDamage: 85, infraDamage: 80,
            severityScore: calc(90, 90, 85, 80), notes: 'Building partially collapsed, major risk', status: AssessmentStatus.PENDING
        });
    }

    // 6 High
    for (let i = 0; i < 6; i++) {
        mockAssessments.push({
            zoneId: zones[i % 3].id, userId: assessor.id, lat: jitter(zones[i % 3].lat), lng: jitter(zones[i % 3].lng), damageType: 'Flooding',
            structureDamage: 70, personsDamage: 60, infraDamage: 65,
            severityScore: calc(70, 72, 60, 65), notes: 'Water levels rising rapidly.', status: AssessmentStatus.VERIFIED
        });
    }

    // 6 Medium
    for (let i = 0; i < 6; i++) {
        mockAssessments.push({
            zoneId: zones[i % 3].id, userId: assessor.id, lat: jitter(zones[i % 3].lat), lng: jitter(zones[i % 3].lng), damageType: 'Fire',
            structureDamage: 45, personsDamage: 35, infraDamage: 40,
            severityScore: calc(45, 48, 35, 40), notes: 'Small fire contained but smoke damage present.', status: AssessmentStatus.PENDING
        });
    }

    // 3 Low
    for (let i = 0; i < 3; i++) {
        mockAssessments.push({
            zoneId: zones[i % 3].id, userId: assessor.id, lat: jitter(zones[i % 3].lat), lng: jitter(zones[i % 3].lng), damageType: 'Electrical',
            structureDamage: 15, personsDamage: 10, infraDamage: 12,
            severityScore: calc(15, 18, 10, 12), notes: 'Power lines down, no structural issues.', status: AssessmentStatus.VERIFIED
        });
    }

    for (const a of mockAssessments) {
        await prisma.assessment.create({ data: a });
    }
    console.log(`✅ Created ${mockAssessments.length} assessments`);

    // 4. Create Alerts (Triggered from High Severity Assessments)
    const alertData = mockAssessments.slice(0, 5); // The 5 critical ones
    for (const [idx, a] of alertData.entries()) {
        const zone = zones.find(z => z.id === a.zoneId);
        const assessmentEntity = await prisma.assessment.findFirst({
            where: { zoneId: a.zoneId, severityScore: a.severityScore },
            skip: idx // Naive offset since we just created them sequentially
        });

        if (assessmentEntity) {
            await prisma.alert.create({
                data: {
                    assessmentId: assessmentEntity.id, zoneId: a.zoneId, severityScore: a.severityScore,
                    message: `CRITICAL: High severity (${a.severityScore}) damage reported in ${zone?.name}.`
                }
            });
        }
    }
    const finalAlertsCount = await prisma.alert.count();
    console.log(`✅ Created ${finalAlertsCount} alerts`);

    console.log('🌱 Database seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
