import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import ProductCard from '../ProductCard';
import ProductCardSkeleton from '../skeletons/ProductCardSkeleton';
import type { Listing } from '../../types';
import { HeartIcon } from '../Icons';

interface SavedPageProps {
    onSelectListing: (listing: Listing) => void;
}

const SavedPage: React.FC<SavedPageProps> = ({ onSelectListing }) => {
    const { user } = useAuth();
    const { listings, isLoading } = useListings();
    
    const savedListings = listings.filter(listing => user?.savedItems?.includes(listing._id));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Saved Items</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : savedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedListings.map((listing) => (
                        <ProductCard key={listing._id} listing={listing} seller={listing.seller} onClick={() => onSelectListing(listing)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">You haven't saved any items yet.</h3>
                    <p className="mt-2 text-gray-500">Click the heart icon on any listing to save it for later.</p>
                </div>
            )}
        </div>
    );
};

export default SavedPage;
