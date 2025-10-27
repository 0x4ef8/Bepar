
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
// FIX: Corrected the icon name from ChatBubbleLeftEllipsisIcon to ChatBubbleOvalLeftEllipsisIcon.
import { BellIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowsRightLeftIcon, TagIcon } from './Icons';
import { timeSince } from '../utils/timeSince';

const NotificationIcon = ({ type }: { type: 'message' | 'transaction' | 'system' | 'offer' }) => {
    switch (type) {
        case 'message':
            return <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-blue-500" />;
        case 'transaction':
            return <ArrowsRightLeftIcon className="w-6 h-6 text-green-500" />;
        case 'offer':
            return <TagIcon className="w-6 h-6 text-purple-500" />;
        default:
            return <BellIcon className="w-6 h-6 text-yellow-500" />;
    }
};


const NotificationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { notifications, markAllAsRead } = useNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border z-50 animate-fade-in-down">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                            <div className="relative flex-shrink-0">
                                <NotificationIcon type={notif.type} />
                                {!notif.read && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                                <p className="text-sm text-gray-600">{notif.body}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeSince(notif.timestamp)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <BellIcon className="w-12 h-12 mx-auto text-gray-300"/>
                        <p className="mt-2">You have no notifications yet.</p>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-center border-t">
                <button onClick={onClose} className="text-sm text-primary font-semibold">
                    Close
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;
