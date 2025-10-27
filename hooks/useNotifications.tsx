
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { AppNotification } from '../types';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationContextType {
    permission: NotificationPermission;
    notifications: AppNotification[];
    requestPermission: () => Promise<void>;
    sendNotification: (title: string, options?: NotificationOptions & { type?: AppNotification['type'] }) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: 'notif-1',
        title: 'Welcome to SuperApp!',
        body: 'Start browsing listings or post your own item to get started.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: true,
        type: 'system',
    },
    {
        id: 'notif-2',
        title: 'New Message from Sita Sharma',
        body: 'Is the "Vintage Wooden Chair" still available?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        type: 'message',
    },
];


export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        } else {
            console.log('This browser does not support desktop notification.');
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        const status = await Notification.requestPermission();
        setPermission(status);
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions & { type?: AppNotification['type'] }) => {
        // Send browser notification if permission is granted
        if (permission === 'granted') {
            new Notification(title, {
                ...options,
                icon: 'https://cdn-icons-png.flaticon.com/512/8138/8138439.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/8138/8138439.png'
            });
        }
        
        // Add notification to in-app list
        const newNotification: AppNotification = {
            id: `notif-${Date.now()}`,
            title,
            body: options?.body || '',
            timestamp: new Date().toISOString(),
            read: false,
            type: options?.type || 'system',
        };
        setNotifications(prev => [newNotification, ...prev]);

    }, [permission]);
    
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, sendNotification, notifications, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
