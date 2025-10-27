import React, { useState, useMemo } from 'react';
import { useListings } from '../../hooks/useListings';
import { useUsers } from '../../hooks/useUsers';
import ProductCard from '../ProductCard';
import { CheckBadgeIcon, StarIcon, ArrowLeftIcon, CalendarIcon, ListBulletIcon, ChatBubbleOvalLeftEllipsisIcon } from '../Icons';
import type { Listing, User, Review } from '../../types';
import { timeSince, formatJoinDate } from '../../utils/timeSince';

interface PublicProfilePageProps {
    user: User;
    onBack: () => void;
    onSelectListing: (listing: Listing) => void;
}

const calculateAverageRating = (reviews?: Review[]) => {
    if (!reviews || reviews.length === 0) {
        return "N/A";
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
};

const KycStatusBadge: React.FC<{ isVerified: boolean }> = ({ isVerified }) => {
    if (isVerified) {
        return (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                <CheckBadgeIcon className="w-4 h-4" />
                Verified
            </div>
        );
    }
    return null;
};

const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ user, onBack, onSelectListing }) => {
    const { users } = useUsers();
    const { listings } = useListings();
    const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

    const userFullName = `${user.firstName} ${user.lastName}`;
    const averageRating = useMemo(() => calculateAverageRating(user.reviews), [user.reviews]);
    const userListings = useMemo(() => listings.filter(l => l.sellerId === user._id && l.status === 'available'), [listings, user._id]);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Back
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                    <img className="w-32 h-32 rounded-full ring-4 ring-primary ring-offset-2" src={user.photo} alt={userFullName} />
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                           <h2 className="text-3xl font-bold text-gray-800">{userFullName}</h2>
                           <KycStatusBadge isVerified={user.isVerified} />
                        </div>
                        <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mt-2">
                           <CalendarIcon className="w-4 h-4" />
                           {formatJoinDate(user.joinedAt)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
                           <div className="text-center p-2 rounded-lg bg-gray-50 flex-grow">
                               <p className="font-bold text-xl">{averageRating}</p>
                               <p className="text-sm text-gray-500">Rating ({user.reviews?.length || 0})</p>
                           </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50 flex-grow">
                               <p className="font-bold text-xl">{userListings.length}</p>
                               <p className="text-sm text-gray-500">Active Listings</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'listings'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Listings ({userListings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'reviews'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Reviews ({user.reviews?.length || 0})
                    </button>
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'listings' && (
                    <>
                        {userListings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {userListings.map(listing => (
                                    <ProductCard 
                                        key={listing._id} 
                                        listing={listing} 
                                        seller={user} 
                                        onClick={() => onSelectListing(listing)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow">
                                <ListBulletIcon className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="mt-4 text-gray-500">{userFullName} has no active listings.</p>
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'reviews' && (
                     <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                        {(user.reviews && user.reviews.length > 0) ? user.reviews.map(review => {
                            const author = users.find(u => u._id === review.authorId);
                            if (!author) return null;
                            const authorFullName = `${author.firstName} ${author.lastName}`;
                            return (
                                <div key={review._id} className="flex items-start gap-3">
                                    <img src={author.photo} alt={authorFullName} className="w-10 h-10 rounded-full" />
                                    <div className="bg-gray-50 p-3 rounded-lg flex-1 border">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-sm text-gray-800">{authorFullName}</p>
                                             <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold">{review.rating}.0</span>
                                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{review.text}</p>
                                        <p className="text-xs text-gray-400 text-right mt-1">{timeSince(review.timestamp)}</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow">
                                <ChatBubbleOvalLeftEllipsisIcon className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="mt-4 text-gray-500">{userFullName} has not received any reviews yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default PublicProfilePage;