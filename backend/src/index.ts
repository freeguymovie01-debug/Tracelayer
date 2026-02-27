import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';

import './config/env';
import { redisClient, redisSubscriber } from './utils/redis';
import { initSocketGateway, emitNewAssessment, emitMapUpdate } from './ws/socket.gateway';
import { initAIModel } from './ai/classify';
import { processNewAssessment } from './services/alert.service';

// We import alertService, but since we haven't built Phase 3 yet, 
// we will mock the processNewAssessment function if it's missing, or we can just import it.
// The specs require doing 'processNewAssessment' during phase 2 in index.ts, so I will prepare it.

import authRoutes from './routes/auth.routes';
import assessmentRoutes from './routes/assessments.routes';
import uploadsRoutes from './routes/uploads.routes';
import aiRoutes from './routes/ai.routes';
import mapRoutes from './routes/map.routes';
import alertsRoutes from './routes/alerts.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/uploads', uploadsRoutes);
app.use('/ai', aiRoutes);
app.use('/map', mapRoutes);
app.use('/alerts', alertsRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler (must be last)
app.use(errorMiddleware);

// Socket.io Setup
initSocketGateway(httpServer);

// Redis Subscriber Setup
redisSubscriber.subscribe('ASSESSMENT_CREATED', (err) => {
    if (err) console.error('Redis subscribe error:', err);
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'ASSESSMENT_CREATED') {
        const assessment = JSON.parse(message);
        emitNewAssessment(assessment);
        emitMapUpdate();
        processNewAssessment(assessment);
    }
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, async () => {
    await initAIModel();
    console.log(`\n🚀 DDA Backend running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
});
