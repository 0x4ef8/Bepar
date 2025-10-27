import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import type { Message, User } from '../types';
import { MOCK_MESSAGES } from '../constants'; // For initial data

interface Conversation {
    partner: User;
    messages: Message[];
    unreadCount: number;
}

interface ChatContextType {
    conversations: Map<string, Conversation>;
    activeChatPartnerId: string | null;
    setActiveChatPartnerId: (partnerId: string | null) => void;
    sendMessage: (receiverId: string, message: string, attachments?: { type: 'image', url: string }[]) => void;
    startConversation: (partner: User) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
    const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);

    // Initialize conversations with mock data
    useEffect(() => {
        if(user) {
            // This is a simplified initialization. A real app would fetch conversations from an API.
            const initialConversations = new Map<string, Conversation>();
            MOCK_MESSAGES.forEach(msg => {
                const partnerId = msg.senderId === user._id ? msg.receiverId : msg.senderId;
                if (!initialConversations.has(partnerId)) {
                     // This part needs access to all users, which is tricky here.
                     // For now, let's assume we can't set the partner object.
                     // A better implementation would fetch this data together.
                }
            });
            // For now, let's skip pre-populating and let it happen dynamically.
        }
    }, [user]);


    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (newMessage: Message) => {
            console.log('Received message via socket:', newMessage);
            const partnerId = newMessage.senderId; // Assuming the message is from the partner
            setConversations(prev => {
                const newConversations = new Map(prev);
                const currentConversation = newConversations.get(partnerId);
                if (currentConversation) {
                    const updatedMessages = [...currentConversation.messages, newMessage];
                    const isChatActive = activeChatPartnerId === partnerId;
                    const newUnreadCount = isChatActive ? 0 : currentConversation.unreadCount + 1;
                    newConversations.set(partnerId, {
                        ...currentConversation,
                        messages: updatedMessages,
                        unreadCount: newUnreadCount,
                    });
                }
                // If conversation doesn't exist, a real app would fetch partner details and create it.
                return newConversations;
            });
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, activeChatPartnerId]);
    
    // Mark messages as read when a chat is opened
    useEffect(() => {
        if (activeChatPartnerId) {
            setConversations(prev => {
                const newConversations = new Map(prev);
                const currentConversation = newConversations.get(activeChatPartnerId);
                if (currentConversation && currentConversation.unreadCount > 0) {
                    newConversations.set(activeChatPartnerId, { ...currentConversation, unreadCount: 0 });
                }
                return newConversations;
            });
        }
    }, [activeChatPartnerId]);


    const sendMessage = useCallback((receiverId: string, messageText: string, attachments?: { type: 'image', url: string }[]) => {
        if (!socket || !user) return;
        
        const message: Message = {
            _id: `temp_${Date.now()}`,
            chatId: `chat_${user._id}_${receiverId}`,
            senderId: user._id,
            receiverId: receiverId,
            message: messageText,
            timestamp: new Date().toISOString(),
            status: 'sent',
            attachments,
        };

        // Optimistically update the UI
        setConversations(prev => {
            const newConversations = new Map(prev);
            const currentConversation = newConversations.get(receiverId);
            if (currentConversation) {
                newConversations.set(receiverId, {
                    ...currentConversation,
                    messages: [...currentConversation.messages, message],
                });
            }
            return newConversations;
        });

        // Emit the message via socket
        socket.emit('send_message', message);
    }, [socket, user]);
    
    const startConversation = useCallback((partner: User) => {
        setConversations(prev => {
            if (prev.has(partner._id)) {
                return prev; // Conversation already exists
            }
            const newConversations = new Map(prev);
            const initialMessages = MOCK_MESSAGES.filter(
                msg => (msg.senderId === user?._id && msg.receiverId === partner._id) || (msg.senderId === partner._id && msg.receiverId === user?._id)
            );
            newConversations.set(partner._id, {
                partner,
                messages: initialMessages,
                unreadCount: 0,
            });
            return newConversations;
        });
        setActiveChatPartnerId(partner._id);
    }, [user]);

    const value = {
        conversations,
        activeChatPartnerId,
        setActiveChatPartnerId,
        sendMessage,
        startConversation,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};