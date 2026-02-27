import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { DisasterReport } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("disaster_token") : null

        if (!token) return

        const socketIo = io(API_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnectionAttempts: 5,
        })

        socketIo.on('connect', () => {
            console.log('Connected to WebSocket')
        })

        socketIo.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err)
        })

        setSocket(socketIo)

        return () => {
            socketIo.disconnect()
        }
    }, [])

    return socket
}
