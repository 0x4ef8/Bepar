import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import type { Listing, User, Comment, ListingCondition } from '../types';
import { api } from '../api';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { haversineDistance } from '../utils/geolocation';
import { useUsers } from './useUsers';

type SortType = 'newest' | 'price-asc' | 'price-desc' | 'best-match' | 'recently-viewed' | 'closest';
type ConditionFilterType = 'any' | ListingCondition;


interface ListingsContextType {
    listings: (Listing & { seller?: User })[];
    filteredListings: (Listing & { seller?: User; distance?: number })[];
    isLoading: boolean;
    isFetchingMore: boolean;
    hasMore: boolean;
    fetchMoreListings: () => void;
    addListing: (newListing: Omit<Listing, '_id' | 'sellerId' | 'createdAt' | 'location' | 'status' | 'distance'>) => Promise<void>;
    updateListing: (listingId: string, updatedData: Partial<Omit<Listing, '_id'>>) => Promise<void>;
    deleteListing: (listingId: string) => Promise<void>;
    addCommentToListing: (listingId: string, commentText: string) => Promise<void>;
    setSearchTerm: (term: string) => void;
    setCategory: (category: 'All' | Listing['category']) => void;
    setSort: (sort: SortType) => void;
    setPriceRange: (range: [number, number]) => void;
    setCondition: (condition: ConditionFilterType) => void;
    trackViewedListing: (listingId: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { userLocation } = useLocation();
    
    const [listingsData, setListingsData] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState<'All' | Listing['category']>('All');
    const [sort, setSort] = useState<SortType>('best-match');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
    const [condition, setCondition] = useState<ConditionFilterType>('any');
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

    useEffect(() => {
        setIsLoading(true);
        api.fetchListings(1).then(response => {
            setListingsData(response.data);
            setHasMore(response.hasMore);
            setPage(2);
            setIsLoading(false);
        });
    }, []);
    
    const fetchMoreListings = useCallback(async () => {
        if (isFetchingMore || !hasMore) return;
        
        setIsFetchingMore(true);
        api.fetchListings(page).then(response => {
            setListingsData(prev => [...prev, ...response.data]);
            setHasMore(response.hasMore);
            setPage(prev => prev + 1);
            setIsFetchingMore(false);
        });
    }, [page, hasMore, isFetchingMore]);

    const listings = useMemo(() => {
        if (users.length === 0) return [];
        return listingsData.map(listing => ({
            ...listing,
            seller: users.find(u => u._id === listing.sellerId)
        }));
    }, [listingsData, users]);

    const trackViewedListing = useCallback((listingId: string) => {
        setRecentlyViewed(prev => {
            const otherIds = prev.filter(id => id !== listingId);
            return [listingId, ...otherIds];
        });
    }, []);


    const addListing = useCallback(async (newListingData: Omit<Listing, '_id' | 'sellerId' | 'createdAt' | 'location' | 'status' | 'distance'>) => {
        if (!user) {
            alert("You must be logged in to post a listing.");
            return;
        }
        const newListing: Listing = {
            _id: `item${Date.now()}`,
            ...newListingData,
            images: newListingData.images.length > 0 ? newListingData.images : ["https://picsum.photos/seed/new_item/600/400"],
            sellerId: user._id,
            status: 'available',
            location: user.location,
            createdAt: new Date().toISOString(),
            comments: [],
        };
        const addedListing = await api.addListing(newListing);
        setListingsData(prev => [addedListing, ...prev]);
    }, [user]);
    
    const updateListing = useCallback(async (listingId: string, updatedData: Partial<Omit<Listing, '_id'>>) => {
        const updatedListing = await api.updateListing(listingId, updatedData);
        if (updatedListing) {
            setListingsData(prevListings => 
                prevListings.map(listing => 
                    listing._id === listingId ? { ...listing, ...updatedListing } : listing
                )
            );
        }
    }, []);
    
    const deleteListing = useCallback(async (listingId: string) => {
        await api.deleteListing(listingId);
        setListingsData(prevListings => prevListings.filter(listing => listing._id !== listingId));
    }, []);

    const addCommentToListing = useCallback(async (listingId: string, commentText: string) => {
        if (!user) return;
        const newComment: Comment = {
            _id: `comment-${Date.now()}`,
            authorId: user._id,
            text: commentText,
            timestamp: new Date().toISOString(),
        };
        const addedComment = await api.addCommentToListing(listingId, newComment);
        setListingsData(prev => prev.map(l => {
            if (l._id === listingId) {
                const existingComments = l.comments || [];
                return { ...l, comments: [...existingComments, addedComment] };
            }
            return l;
        }));
    }, [user]);

    const filteredListings = useMemo(() => {
        let resultWithDistance = listings.map(l => ({
            ...l,
            distance: userLocation ? haversineDistance(userLocation, l.location) : undefined,
        }));
        
        let result = [...resultWithDistance];
        
        if (searchTerm) {
            result = result.filter(l => 
                l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (category !== 'All') {
            result = result.filter(l => l.category === category);
        }
        
        if (condition !== 'any') {
            result = result.filter(l => l.condition === condition);
        }
        
        const effectiveMaxPrice = priceRange[1] >= 100000 ? Infinity : priceRange[1];
        result = result.filter(l => l.price >= priceRange[0] && l.price <= effectiveMaxPrice);

        switch (sort) {
            case 'best-match':
                result.sort((a, b) => {
                    const commentsA = a.comments?.length || 0;
                    const commentsB = b.comments?.length || 0;
                    if (commentsB !== commentsA) {
                        return commentsB - commentsA;
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                break;
            case 'recently-viewed':
                result.sort((a, b) => {
                    const indexA = recentlyViewed.indexOf(a._id);
                    const indexB = recentlyViewed.indexOf(b._id);

                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
                break;
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'closest':
                result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [listings, searchTerm, category, sort, priceRange, condition, recentlyViewed, userLocation]);

    return (
        <ListingsContext.Provider value={{ 
            listings, 
            filteredListings, 
            isLoading,
            isFetchingMore,
            hasMore,
            fetchMoreListings,
            addListing,
            updateListing,
            deleteListing,
            addCommentToListing,
            setSearchTerm,
            setCategory,
            setSort,
            setPriceRange,
            setCondition,
            trackViewedListing
        }}>
            {children}
        </ListingsContext.Provider>
    );
};

export const useListings = (): ListingsContextType => {
    const context = useContext(ListingsContext);
    if (context === undefined) {
        throw new Error('useListings must be used within a ListingsProvider');
    }
    return context;
};