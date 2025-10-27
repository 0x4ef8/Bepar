
import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// In a real app, this URL would point to your backend server.
const SOCKET_SERVER_URL = "http://localhost:3000"; // Placeholder

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    // FIX: useState was used but not imported.
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user?._id) {
            // If there's a user, establish the connection.
            // The `io()` function will be available because we added it to index.html
            const socket = io(SOCKET_SERVER_URL, {
                query: { userId: user._id },
                reconnectionAttempts: 5,
            });

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });
            
            // Log all incoming events for debugging
            socket.onAny((event, ...args) => {
                console.log(`Socket event received: ${event}`, args);
            });

            socketRef.current = socket;

            return () => {
                // Cleanup on component unmount or user change
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            };
        } else {
            // If no user, ensure any existing connection is closed.
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
