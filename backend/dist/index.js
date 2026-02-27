"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
require("./config/env");
const redis_1 = require("./utils/redis");
const socket_gateway_1 = require("./ws/socket.gateway");
const classify_1 = require("./ai/classify");
const alert_service_1 = require("./services/alert.service");
// We import alertService, but since we haven't built Phase 3 yet, 
// we will mock the processNewAssessment function if it's missing, or we can just import it.
// The specs require doing 'processNewAssessment' during phase 2 in index.ts, so I will prepare it.
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const assessments_routes_1 = __importDefault(require("./routes/assessments.routes"));
const uploads_routes_1 = __importDefault(require("./routes/uploads.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const map_routes_1 = __importDefault(require("./routes/map.routes"));
const alerts_routes_1 = __importDefault(require("./routes/alerts.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/auth', auth_routes_1.default);
app.use('/assessments', assessments_routes_1.default);
app.use('/uploads', uploads_routes_1.default);
app.use('/ai', ai_routes_1.default);
app.use('/map', map_routes_1.default);
app.use('/alerts', alerts_routes_1.default);
app.use('/analytics', analytics_routes_1.default);
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));
// Error handler (must be last)
app.use(error_middleware_1.errorMiddleware);
// Socket.io Setup
(0, socket_gateway_1.initSocketGateway)(httpServer);
// Redis Subscriber Setup
redis_1.redisSubscriber.subscribe('ASSESSMENT_CREATED', (err) => {
    if (err)
        console.error('Redis subscribe error:', err);
});
redis_1.redisSubscriber.on('message', (channel, message) => {
    if (channel === 'ASSESSMENT_CREATED') {
        const assessment = JSON.parse(message);
        (0, socket_gateway_1.emitNewAssessment)(assessment);
        (0, socket_gateway_1.emitMapUpdate)();
        (0, alert_service_1.processNewAssessment)(assessment);
    }
});
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, async () => {
    await (0, classify_1.initAIModel)();
    console.log(`\n🚀 DDA Backend running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
});
