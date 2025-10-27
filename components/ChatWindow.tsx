import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { PaperAirplaneIcon, PaperClipIcon, CheckIcon, ChevronLeftIcon } from './Icons';
import type { Message, User } from '../types';
import ImageViewerModal from './modals/ImageViewerModal';

interface ChatWindowProps {
    partner: User;
    messages: Message[];
    onBack: () => void;
}

const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


const ChatWindow: React.FC<ChatWindowProps> = ({ partner, messages, onBack }) => {
    const { user } = useAuth();
    const { sendMessage } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<{ type: 'image', url: string }[]>([]);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = () => {
        if ((newMessage.trim() === '' && attachments.length === 0) || !user) return;
        sendMessage(partner._id, newMessage, attachments);
        setNewMessage('');
        setAttachments([]);
    };

    const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if(event.target?.result) {
                    setAttachments(prev => [...prev, { type: 'image', url: event.target!.result as string }]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user || !partner) return null;
    
    const partnerFullName = `${partner.firstName} ${partner.lastName}`;
        
    const ReadReceipt = ({ status }: { status?: Message['status'] }) => {
        if (!status) return null;
        const color = status === 'read' ? 'text-blue-400' : 'text-gray-400';
        const doubleCheck = status === 'delivered' || status === 'read';
        return (
            <div className="relative w-4 h-4">
                <CheckIcon className={`w-4 h-4 absolute right-0 ${color}`} />
                {doubleCheck && <CheckIcon className={`w-4 h-4 absolute right-1 ${color}`} />}
            </div>
        );
    };

    return (
        <div className="h-full w-full bg-white flex flex-col">
            {viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
            <header className="flex items-center p-3 border-b bg-gray-50 sticky top-0 z-10">
                 <button onClick={onBack} className="md:hidden mr-2 text-gray-500 hover:text-gray-800">
                    <ChevronLeftIcon className="w-6 h-6"/>
                </button>
                <div className="flex items-center">
                    <img src={partner.photo} alt={partnerFullName} className="w-8 h-8 rounded-full" />
                    <span className="ml-2 font-semibold text-gray-800">{partnerFullName}</span>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
                {(() => {
                    let lastDate: string | null = null;
                    return messages.map(msg => {
                        const currentDate = new Date(msg.timestamp).toDateString();
                        let dateSeparator = null;

                        if (currentDate !== lastDate) {
                            dateSeparator = (
                                <div key={`sep-${currentDate}`} className="text-center my-4">
                                    <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                                        {formatDateSeparator(new Date(msg.timestamp))}
                                    </span>
                                </div>
                            );
                            lastDate = currentDate;
                        }
                        
                        const isSent = msg.senderId === user._id;

                        return (
                            <React.Fragment key={msg._id}>
                                {dateSeparator}
                                <div className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                                    {isSent && <ReadReceipt status={msg.status} />}
                                    <div className={`max-w-xs lg:max-w-md p-1 ${isSent ? 'bg-primary text-white rounded-t-xl rounded-bl-xl' : 'bg-white text-gray-800 shadow-sm rounded-t-xl rounded-br-xl'}`}>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="grid grid-cols-2 gap-1 p-2">
                                                {msg.attachments.map((att, idx) => (
                                                    <img key={idx} src={att.url} className="w-24 h-24 object-cover rounded-md cursor-pointer" onClick={() => setViewingImage(att.url)}/>
                                                ))}
                                            </div>
                                        )}
                                        {msg.message && <p className="px-3 py-1">{msg.message}</p>}
                                        <p className="text-xs opacity-70 mt-1 px-3 pb-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    });
                })()}
                {/* Typing indicator can be added back here if needed */}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t bg-white">
                {attachments.length > 0 && (
                    <div className="flex gap-2 p-2 border-b">
                        {attachments.map((att, idx) => (
                           <div key={idx} className="relative">
                               <img src={att.url} className="w-16 h-16 object-cover rounded-md" />
                               <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                           </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center">
                    <input type="file" ref={fileInputRef} onChange={handleAttachment} accept="image/*" className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary transition-colors">
                        <PaperClipIcon className="w-5 h-5"/>
                    </button>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                        onClick={handleSendMessage} 
                        className="p-2 text-white bg-primary rounded-full hover:bg-blue-700 transition-colors ml-2 disabled:bg-gray-300" 
                        disabled={newMessage.trim() === '' && attachments.length === 0}
                    >
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;