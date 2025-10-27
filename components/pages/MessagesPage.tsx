

import React, { useMemo } from 'react';
import { useChat } from '../../hooks/useChat';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import ChatWindow from '../ChatWindow';
import { UserIcon } from '../Icons';
import { timeSince } from '../../utils/timeSince';
// FIX: MOCK_MESSAGES was used but not imported.
import { MOCK_MESSAGES } from '../../constants';

const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const { conversations, activeChatPartnerId, setActiveChatPartnerId, startConversation } = useChat();
    const { users } = useUsers(); // Get all users to find partner details
    
    // In a real app, conversations would be fetched from an API with partner data included.
    // Here, we dynamically create conversation objects if they don't exist yet,
    // which is needed since our mock setup is simple.
    useMemo(() => {
        if (!user) return;
        const allUserIdsInMockMessages = new Set<string>();
        // Find all unique users the current user has messaged
        MOCK_MESSAGES.forEach(msg => {
            if(msg.senderId === user._id) allUserIdsInMockMessages.add(msg.receiverId);
            if(msg.receiverId === user._id) allUserIdsInMockMessages.add(msg.senderId);
        });
        
        allUserIdsInMockMessages.forEach(partnerId => {
            if (!conversations.has(partnerId)) {
                const partner = users.find(u => u._id === partnerId);
                if (partner) {
                    startConversation(partner);
                }
            }
        });

    }, [users, user, startConversation, conversations]);
    
    const conversationList = Array.from(conversations.values());
    const activeConversation = activeChatPartnerId ? conversations.get(activeChatPartnerId) : null;

    if (!user) return null;

    const mainContent = activeConversation ? (
        <ChatWindow 
            partner={activeConversation.partner} 
            messages={activeConversation.messages} 
            onBack={() => setActiveChatPartnerId(null)}
        />
    ) : (
        <div className="hidden md:flex h-full flex-col items-center justify-center bg-gray-100 text-center">
            <UserIcon className="w-24 h-24 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Select a conversation</h3>
            <p className="mt-2 text-gray-500">Choose from your existing conversations to start chatting.</p>
        </div>
    );
    
    const showChatWindow = !!activeConversation;
    
    return (
        <div className="container mx-auto h-[calc(100vh-64px)] flex">
            <aside className={`w-full md:w-1/3 lg:w-1/4 border-r bg-white flex-col ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversationList.map(({ partner, messages, unreadCount }) => {
                        const lastMessage = messages[messages.length - 1];
                        const partnerFullName = `${partner.firstName} ${partner.lastName}`;
                        return (
                            <div
                                key={partner._id}
                                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${activeChatPartnerId === partner._id ? 'bg-blue-50' : ''}`}
                                onClick={() => setActiveChatPartnerId(partner._id)}
                            >
                                <div className="relative">
                                    {/* FIX: Use firstName and lastName instead of non-existent name property. */}
                                    <img src={partner.photo} alt={partnerFullName} className="w-12 h-12 rounded-full" />
                                    {unreadCount > 0 && 
                                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                                    }
                                </div>
                                <div className="ml-3 flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        {/* FIX: Use firstName and lastName instead of non-existent name property. */}
                                        <p className="font-semibold truncate">{partnerFullName}</p>
                                        <p className="text-xs text-gray-500 flex-shrink-0">{lastMessage ? timeSince(lastMessage.timestamp) : ''}</p>
                                    </div>
                                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                        {lastMessage?.message || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </aside>
            <main className={`flex-1 ${!showChatWindow ? 'hidden md:block' : 'block'}`}>
                {mainContent}
            </main>
        </div>
    );
};

export default MessagesPage;
