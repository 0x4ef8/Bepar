import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './components/pages/LoginPage';
import MarketplacePage from './components/pages/MarketplacePage';
import { NotificationProvider, useNotifications } from './hooks/useNotifications';
import { ListingsProvider } from './hooks/useListings';
import { WalletProvider } from './hooks/useWallet';
import { LocationProvider } from './hooks/useLocation';
import { UsersProvider } from './hooks/useUsers';
import { OffersProvider } from './hooks/useOffers';
import { SocketProvider } from './hooks/useSocket';
import { ChatProvider } from './hooks/useChat';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { requestPermission, permission } = useNotifications();

    useEffect(() => {
        // Request permission once the user is logged in, but not immediately.
        if (user && permission === 'default') {
            const timer = setTimeout(() => {
                requestPermission();
            }, 3000); // 3-second delay
            return () => clearTimeout(timer);
        }
    }, [user, permission, requestPermission]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {user ? <MarketplacePage /> : <LoginPage />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <NotificationProvider>
            <AuthProvider>
                <UsersProvider>
                    <SocketProvider>
                        <ChatProvider>
                            <LocationProvider>
                                <ListingsProvider>
                                    <WalletProvider>
                                        <OffersProvider>
                                            <AppContent />
                                        </OffersProvider>
                                    </WalletProvider>
                                </ListingsProvider>
                            </LocationProvider>
                        </ChatProvider>
                    </SocketProvider>
                </UsersProvider>
            </AuthProvider>
        </NotificationProvider>
    );
};

export default App;