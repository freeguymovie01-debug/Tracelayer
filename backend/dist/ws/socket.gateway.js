"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketGateway = initSocketGateway;
exports.emitNewAssessment = emitNewAssessment;
exports.emitAlertFired = emitAlertFired;
exports.emitMapUpdate = emitMapUpdate;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
let io;
function initSocketGateway(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                socket.data.user = decoded;
            }
            catch (_) { }
        }
        next();
    });
    io.on('connection', (socket) => {
        console.log(`📡 Socket connected: ${socket.id}`);
        socket.on('subscribe:zone', ({ zoneId }) => socket.join(`zone:${zoneId}`));
        socket.on('disconnect', () => console.log(`📡 Socket disconnected: ${socket.id}`));
    });
    return io;
}
function emitNewAssessment(assessment) {
    io?.emit('newAssessment', assessment);
}
function emitAlertFired(alert) {
    io?.emit('alertFired', alert);
}
function emitMapUpdate() {
    io?.emit('mapUpdate', { type: 'invalidate' });
}
function getIO() {
    return io;
}
