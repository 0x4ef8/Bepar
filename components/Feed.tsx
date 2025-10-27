

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useListings } from '../hooks/useListings';
import { useLocation } from '../hooks/useLocation';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';
import InteractiveMap from './InteractiveMap';
import type { Listing } from '../types';
import { AdjustmentsHorizontalIcon, MapPinIcon, ListBulletIcon } from './Icons';
import FiltersModal from './modals/FiltersModal';
import WelcomeBanner from './WelcomeBanner';
import FeedLoaderSkeleton from './skeletons/FeedLoaderSkeleton';

interface FeedProps {
    onSelectListing: (listing: Listing) => void;
    onOpenKyc: () => void;
}

const Feed: React.FC<FeedProps> = ({ onSelectListing, onOpenKyc }) => {
    const { 
        filteredListings, 
        isLoading,
        isFetchingMore,
        hasMore,
        fetchMoreListings,
        setCategory,
        setSort
    } = useListings();
    const { permissionStatus, isLocating } = useLocation();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
    
    const observer = useRef<IntersectionObserver>();
    // FIX: Resolved "Expected 1 arguments, but got 0" error by adding the 'node' argument to the useCallback arrow function.
    const lastListingElementRef = useCallback((node) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreListings();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore, hasMore, fetchMoreListings]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <WelcomeBanner onOpenKyc={onOpenKyc} />
            {isLocating && (
                <div className="text-sm text-center text-blue-700 bg-blue-100 p-3 rounded-lg mb-6">
                    Getting your location to find nearby deals...
                </div>
            )}
            {permissionStatus === 'denied' && (
                <div className="text-sm text-center text-red-700 bg-red-100 p-3 rounded-lg mb-6">
                    Location access denied. "Sort by Closest" is disabled. You can change this in your browser settings.
                </div>
            )}
            {isFiltersModalOpen && <FiltersModal onClose={() => setFiltersModalOpen(false)} />}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Explore Nearby</h2>
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border">
                     <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
                    >
                        <ListBulletIcon className="w-5 h-5 inline-block mr-1"/>
                        List
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-600'}`}
                    >
                        <MapPinIcon className="w-5 h-5 inline-block mr-1"/>
                        Map
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                    >
                        <option value="All">Category: All</option>
                        <option>Electronics</option>
                        <option>Furniture</option>
                        <option>Vehicles</option>
                        <option>Clothing</option>
                        {/* FIX: Added missing "Other" category to match the type definition. */}
                        <option>Other</option>
                    </select>
                     <select 
                        onChange={(e) => setSort(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                        defaultValue="best-match"
                    >
                        <option value="best-match">Sort: Best Match</option>
                        <option value="newest">Sort: Newest First</option>
                        <option value="closest" disabled={permissionStatus !== 'granted'}>Sort: Closest First</option>
                        <option value="recently-viewed">Sort: Recently Viewed</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                     <button onClick={() => setFiltersModalOpen(true)} className="flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-4 py-2 text-center transition-colors">
                        <AdjustmentsHorizontalIcon className="w-5 h-5"/>
                        Filters
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading 
                            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            : filteredListings.map((listing, index) => {
                                if (filteredListings.length === index + 1) {
                                    return <div ref={lastListingElementRef} key={listing._id}><ProductCard listing={listing} seller={listing.seller} onClick={() => onSelectListing(listing)} /></div>
                                } else {
                                    return <ProductCard key={listing._id} listing={listing} seller={listing.seller} onClick={() => onSelectListing(listing)} />
                                }
                            })
                        }
                    </div>
                    {isFetchingMore && <FeedLoaderSkeleton />}
                    {!hasMore && !isLoading && (
                        <p className="text-center text-gray-500 mt-8">You've reached the end of the listings.</p>
                    )}
                </>
            ) : (
                <InteractiveMap listings={filteredListings} onSelectListing={onSelectListing} />
            )}
        </div>
    );
};

export default Feed;
