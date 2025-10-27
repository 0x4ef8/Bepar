import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Feed from '../Feed';
import Wallet from '../Wallet';
import Profile from '../Profile';
import SavedPage from './SavedPage';
import DashboardPage from './DashboardPage';
import AIStudioPage from './AIStudioPage';
import MessagesPage from './MessagesPage';
import PublicProfilePage from './PublicProfilePage'; // Import the new PublicProfilePage
import { HomeIcon, WalletIcon, UserCircleIcon, BookmarkIcon, ChartPieIcon, SparklesIcon, ChatBubbleOvalLeftEllipsisIcon } from '../Icons';
import type { Listing, User } from '../../types';
import ProductDetail from '../ProductDetail';
import PostListingModal from '../modals/PostListingModal';
import KycModal from '../KycModal';
import DepositModal from '../modals/DepositModal';
import WithdrawModal from '../modals/WithdrawModal';
import { useListings } from '../../hooks/useListings';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useUsers } from '../../hooks/useUsers';

type Page = 'feed' | 'wallet' | 'profile' | 'saved' | 'dashboard' | 'aistudio' | 'messages';

const MarketplacePage: React.FC = () => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { startConversation, setActiveChatPartnerId } = useChat();
    const [currentPage, setCurrentPage] = useState<Page>('feed');
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null); // State for public profile
    const [isPostListingModalOpen, setPostListingModalOpen] = useState(false);
    const [isKycModalOpen, setKycModalOpen] = useState(false);
    const [isDepositModalOpen, setDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const { trackViewedListing } = useListings();
    const { requestLocation } = useLocation();

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);
    
    const openChatWithSeller = (sellerId: string) => {
        const seller = users.find(u => u._id === sellerId);
        if (seller) {
            startConversation(seller);
            setCurrentPage('messages');
        }
    };
    
     const handleNavigation = (page: Page) => {
        setSelectedListing(null);
        setViewingProfile(null);
        // If navigating to messages, we shouldn't clear the active chat
        if (page !== 'messages') {
            setActiveChatPartnerId(null);
        }
        setCurrentPage(page);
    };

    const handleSelectListing = (listing: Listing) => {
        trackViewedListing(listing._id);
        setSelectedListing(listing);
        setViewingProfile(null); // Ensure we are not viewing a profile at the same time
    };

    const handleViewProfile = (userToView: User) => {
        setViewingProfile(userToView);
    };

    const handleBackFromProfile = () => {
        setViewingProfile(null);
        // If the user was viewing a listing before, they remain on that listing detail page.
        // Otherwise, they go back to the current main page (e.g. feed).
    };
    
    const handleOpenKycModal = () => setKycModalOpen(true);

    const handlePostListingClick = () => {
        if (user && !user.isVerified) {
            handleOpenKycModal();
        } else {
            setPostListingModalOpen(true);
        }
    };

    const renderContent = () => {
        if (viewingProfile) {
            return <PublicProfilePage user={viewingProfile} onBack={handleBackFromProfile} onSelectListing={handleSelectListing} />;
        }
        if (selectedListing) {
            return <ProductDetail listing={selectedListing} onBack={() => setSelectedListing(null)} onChat={openChatWithSeller} onOpenKyc={handleOpenKycModal} onViewProfile={handleViewProfile} />;
        }
        switch (currentPage) {
            case 'feed':
                return <Feed onSelectListing={handleSelectListing} onOpenKyc={handleOpenKycModal} />;
            case 'dashboard':
                return <DashboardPage />;
            case 'aistudio':
                return <AIStudioPage />;
            case 'wallet':
                return <Wallet onDeposit={() => setDepositModalOpen(true)} onWithdraw={() => setWithdrawModalOpen(true)} />;
            case 'profile':
                return <Profile onPostListing={handlePostListingClick} />;
            case 'saved':
                return <SavedPage onSelectListing={handleSelectListing} />;
            case 'messages':
                return <MessagesPage />;
            default:
                return <Feed onSelectListing={handleSelectListing} onOpenKyc={handleOpenKycModal} />;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {isPostListingModalOpen && <PostListingModal onClose={() => setPostListingModalOpen(false)} />}
            {isKycModalOpen && <KycModal onClose={() => setKycModalOpen(false)} />}
            {isDepositModalOpen && <DepositModal onClose={() => setDepositModalOpen(false)} />}
            {isWithdrawModalOpen && <WithdrawModal onClose={() => setWithdrawModalOpen(false)} />}
            <Header onPostListing={handlePostListingClick} onNavigate={handleNavigation}/>
            <main className="flex-grow overflow-y-auto pb-24 bg-gray-100">
                {renderContent()}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg md:hidden">
                <div className="flex justify-around max-w-full mx-auto">
                    <button onClick={() => handleNavigation('feed')} className={`flex flex-col items-center justify-center p-2 w-full ${currentPage === 'feed' && !selectedListing && !viewingProfile ? 'text-primary' : 'text-gray-500'}`}>
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Home</span>
                    </button>
                    <button onClick={() => handleNavigation('saved')} className={`flex flex-col items-center justify-center p-2 w-full ${currentPage === 'saved' ? 'text-primary' : 'text-gray-500'}`}>
                        <BookmarkIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Saved</span>
                    </button>
                     <button onClick={() => handleNavigation('messages')} className={`flex flex-col items-center justify-center p-2 w-full ${currentPage === 'messages' ? 'text-primary' : 'text-gray-500'}`}>
                        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Messages</span>
                    </button>
                    <button onClick={() => handleNavigation('dashboard')} className={`flex flex-col items-center justify-center p-2 w-full ${currentPage === 'dashboard' ? 'text-primary' : 'text-gray-500'}`}>
                        <ChartPieIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Dashboard</span>
                    </button>
                    <button onClick={() => handleNavigation('profile')} className={`flex flex-col items-center justify-center p-2 w-full ${currentPage === 'profile' ? 'text-primary' : 'text-gray-500'}`}>
                        <UserCircleIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default MarketplacePage;