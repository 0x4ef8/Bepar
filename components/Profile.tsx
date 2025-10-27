// Created by Bishesh

import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useListings } from '../hooks/useListings';
import { useUsers } from '../hooks/useUsers';
import ProductCard from './ProductCard';
import EditProfileModal from './modals/EditProfileModal';
import EditListingModal from './modals/EditListingModal';
import {
    CheckBadgeIcon,
    PencilIcon,
    WalletIcon,
    ClockIcon,
    ShieldExclamationIcon,
    ExclamationCircleIcon,
    StarIcon,
    CalendarIcon
} from './Icons';
import type { Listing, User, Review } from '../../types';
import { timeSince, formatJoinDate } from '../utils/timeSince';

interface ProfileProps {
    onPostListing: () => void;
}

const KycStatusBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
    switch (status) {
        case 'verified':
            return (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Verified
                </div>
            );
        case 'pending':
            return (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <ClockIcon className="w-4 h-4" />
                    Pending Verification
                </div>
            );
        case 'rejected':
            return (
                <div className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    Verification Rejected
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <ShieldExclamationIcon className="w-4 h-4" />
                    Unverified
                </div>
            );
    }
};

const calculateAverageRating = (reviews?: Review[]) => {
    if (!reviews || reviews.length === 0) return 'N/A';
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
};

const Profile: React.FC<ProfileProps> = ({ onPostListing }) => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { listings } = useListings();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);

    const currentUserData = useMemo(
        () => users.find(u => u._id === user?._id),
        [users, user]
    );

    if (!currentUserData) return null;

    const currentUserFullName = `${currentUserData.firstName} ${currentUserData.lastName}`;
    const averageRating = calculateAverageRating(currentUserData.reviews);
    const userListings = listings.filter(l => l.sellerId === currentUserData._id);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {isEditModalOpen && <EditProfileModal onClose={() => setEditModalOpen(false)} />}
            {editingListing && <EditListingModal listing={editingListing} onClose={() => setEditingListing(null)} />}

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                    <img
                        className="w-32 h-32 rounded-full ring-4 ring-primary ring-offset-2"
                        src={currentUserData.photo}
                        alt={currentUserFullName}
                    />
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <h2 className="text-3xl font-bold text-gray-800">
                                {currentUserFullName}
                            </h2>
                            <KycStatusBadge status={currentUserData.kycStatus} />
                        </div>
                        <p className="text-gray-600 mt-1">{currentUserData.phone}</p>
                        <p className="text-gray-600">
                            {currentUserData.email || 'No email provided.'}
                        </p>
                        <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mt-2">
                            <CalendarIcon className="w-4 h-4" />
                            {formatJoinDate(currentUserData.joinedAt)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
                            <div className="text-center p-2 rounded-lg bg-gray-50 flex-grow">
                                <p className="font-bold text-xl">{averageRating}</p>
                                <p className="text-sm text-gray-500">
                                    Rating ({currentUserData.reviews?.length || 0})
                                </p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50 flex-grow">
                                <p className="font-bold text-xl">{userListings.length}</p>
                                <p className="text-sm text-gray-500">Listings</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50 flex-grow">
                                <p className="font-bold text-xl">
                                    रू{currentUserData.walletBalance.toLocaleString('en-NP')}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                                    <WalletIcon className="w-4 h-4" /> Wallet
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="sm:ml-auto flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Listings & Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Listings */}
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">My Listings</h3>
                    {userListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {userListings.map(listing => (
                                <ProductCard
                                    key={listing._id}
                                    listing={listing}
                                    seller={currentUserData}
                                    onClick={() => alert(`Viewing ${listing.title}`)}
                                    onEdit={() => setEditingListing(listing)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow">
                            <p className="text-gray-500">You haven't listed any items yet.</p>
                            <button
                                onClick={onPostListing}
                                className="mt-4 bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Post Your First Item
                            </button>
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <div className="lg:col-span-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">My Reviews</h3>
                    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                        {currentUserData.reviews && currentUserData.reviews.length > 0 ? (
                            currentUserData.reviews.map(review => {
                                const author = users.find(u => u._id === review.authorId);
                                if (!author) return null;
                                const authorFullName = `${author.firstName} ${author.lastName}`;
                                return (
                                    <div key={review._id} className="flex items-start gap-3">
                                        <img
                                            src={author.photo}
                                            alt={authorFullName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="bg-gray-50 p-3 rounded-lg flex-1 border">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm text-gray-800">
                                                    {authorFullName}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold">
                                                        {review.rating}.0
                                                    </span>
                                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {review.text}
                                            </p>
                                            <p className="text-xs text-gray-400 text-right mt-1">
                                                {timeSince(review.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                You have not received any reviews yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
