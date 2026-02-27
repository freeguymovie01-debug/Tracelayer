"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const zod_1 = require("zod");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)('dev'));
// Uploads static directory
exports.app.use('/uploads', express_1.default.static('src/uploads'));
const auth_routes_1 = require("./routes/auth.routes");
const ai_routes_1 = require("./routes/ai.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const assessments_routes_1 = require("./routes/assessments.routes");
const alerts_routes_1 = require("./routes/alerts.routes");
const uploads_routes_1 = require("./routes/uploads.routes");
exports.app.use('/auth', auth_routes_1.authRouter);
exports.app.use('/ai', ai_routes_1.aiRouter);
exports.app.use('/analytics', analytics_routes_1.analyticsRouter);
exports.app.use('/map', analytics_routes_1.mapRouter);
exports.app.use('/assessments', assessments_routes_1.assessmentsRouter);
exports.app.use('/alerts', alerts_routes_1.alertsRouter);
exports.app.use('/uploads', uploads_routes_1.uploadsRouter);
exports.app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('[Error]:', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
