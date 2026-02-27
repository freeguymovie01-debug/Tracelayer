import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let io: SocketServer;

export function initSocketGateway(httpServer: HttpServer): SocketServer {
    io = new SocketServer(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, env.JWT_SECRET);
                socket.data.user = decoded;
            } catch (_) { }
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

export function emitNewAssessment(assessment: object): void {
    io?.emit('newAssessment', assessment);
}

export function emitAlertFired(alert: object): void {
    io?.emit('alertFired', alert);
}

export function emitMapUpdate(): void {
    io?.emit('mapUpdate', { type: 'invalidate' });
}

export function getIO(): SocketServer {
    return io;
}
