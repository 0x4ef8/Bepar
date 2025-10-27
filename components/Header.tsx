
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useListings } from '../hooks/useListings';
import { useNotifications } from '../hooks/useNotifications';
import { BellIcon, PlusCircleIcon, NewspaperIcon, BookmarkIcon, SparklesIcon } from './Icons';
import NotificationsPanel from './NotificationsPanel';
import SignOutModal from './modals/SignOutModal';

interface HeaderProps {
    onPostListing: () => void;
    onNavigate: (page: 'feed' | 'wallet' | 'profile' | 'saved' | 'dashboard' | 'aistudio' | 'messages') => void;
}

const Header: React.FC<HeaderProps> = ({ onPostListing, onNavigate }) => {
    const { user, logout } = useAuth();
    const { sendNotification, notifications } = useNotifications();
    const { setSearchTerm } = useListings();
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isSignOutModalOpen, setSignOutModalOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleDigestNotification = () => {
        sendNotification('Your Weekly Digest is here!', {
            body: 'Check out the latest listings for Electronics and Furniture near you.'
        });
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSignOut = () => {
        logout();
        setSignOutModalOpen(false);
    }

    return (
        <>
            {isSignOutModalOpen && (
                <SignOutModal 
                    onClose={() => setSignOutModalOpen(false)}
                    onConfirm={handleSignOut}
                />
            )}
            <header className="sticky top-0 z-30 bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('feed')}>
                            <div className="flex-shrink-0 text-2xl font-bold text-primary">
                                Bepār
                            </div>
                        </div>
                        <div className="flex-1 max-w-lg mx-4 hidden md:block">
                             <input
                                type="text"
                                placeholder="Search for items..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button onClick={onPostListing} className="flex items-center gap-2 text-white bg-primary hover:bg-blue-700 font-medium rounded-full text-sm px-4 py-2 text-center transition-colors">
                               <PlusCircleIcon className="w-5 h-5"/>
                               <span className="hidden md:block">Post Item</span>
                            </button>
                            <button onClick={handleDigestNotification} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" title="Get Weekly Digest">
                               <NewspaperIcon className="w-6 h-6"/>
                            </button>
                             <button onClick={() => onNavigate('saved')} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 hidden md:block" title="Saved Items">
                               <BookmarkIcon className="w-6 h-6"/>
                            </button>
                            <div className="relative" ref={notificationsRef}>
                                <button onClick={() => setNotificationsOpen(prev => !prev)} className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" title="Notifications">
                                   <BellIcon className="w-6 h-6"/>
                                   {unreadCount > 0 && (
                                       <span className="absolute top-0 right-0 flex h-2 w-2">
                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                           <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                       </span>
                                   )}
                                </button>
                                {isNotificationsOpen && <NotificationsPanel onClose={() => setNotificationsOpen(false)} />}
                            </div>
                            <div className="relative group">
                                <img
                                    className="h-10 w-10 rounded-full cursor-pointer"
                                    src={user?.photo}
                                    alt="User"
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                                    <div className="px-4 py-2 text-sm text-gray-700">
                                        <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                                    </div>
                                    <div className="border-t border-gray-100"></div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('messages'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('aistudio'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">AI Studio</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('saved'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Saved Items</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('wallet'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wallet</a>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                        onClick={() => setSignOutModalOpen(true)}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;