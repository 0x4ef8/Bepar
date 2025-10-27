import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Offer, Listing } from '../types';
import { api } from '../api';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useUsers } from './useUsers';

interface OffersContextType {
    offers: Offer[];
    makeOffer: (listing: Listing, amount: number) => Promise<void>;
    acceptOffer: (offerId: string) => Promise<void>;
    rejectOffer: (offerId: string) => Promise<void>;
    withdrawOffer: (offerId: string) => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const OffersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { sendNotification } = useNotifications();
    const [offers, setOffers] = useState<Offer[]>([]);

    useEffect(() => {
        api.fetchOffers().then(data => {
            setOffers(data);
        });
    }, []);

    const makeOffer = useCallback(async (listing: Listing, amount: number) => {
        if (!user) {
            alert("You must be logged in to make an offer.");
            return;
        }

        const newOffer: Offer = {
            _id: `offer${Date.now()}`,
            listingId: listing._id,
            buyerId: user._id,
            sellerId: listing.sellerId,
            amount: amount,
            status: 'pending',
            timestamp: new Date().toISOString(),
        };
        
        const addedOffer = await api.makeOffer(newOffer);
        setOffers(prev => [addedOffer, ...prev]);

        sendNotification(`New Offer on ${listing.title}`, {
            // FIX: Use firstName and lastName instead of non-existent name property.
            body: `${user.firstName} ${user.lastName} offered रू${amount.toLocaleString('en-NP')}.`,
            type: 'offer'
        });
        
        alert(`Your offer of रू${amount.toLocaleString('en-NP')} has been sent!`);

    }, [user, sendNotification]);
    
    const acceptOffer = useCallback(async (offerId: string) => {
        const offer = offers.find(o => o._id === offerId);
        if (!offer) return;
        
        const updatedOffer = await api.updateOfferStatus(offerId, 'accepted');
        if (updatedOffer) {
            setOffers(prev => prev.map(o => o._id === offerId ? updatedOffer : o));
        }
        
        sendNotification(`Offer Accepted!`, {
            body: `Your offer for रू${offer.amount.toLocaleString('en-NP')} has been accepted. Proceed to payment.`,
            type: 'offer'
        });
    }, [offers, sendNotification]);

    const rejectOffer = useCallback(async (offerId: string) => {
        const offer = offers.find(o => o._id === offerId);
        if (!offer) return;

        const updatedOffer = await api.updateOfferStatus(offerId, 'rejected');
        if (updatedOffer) {
            setOffers(prev => prev.map(o => o._id === offerId ? updatedOffer : o));
        }
        sendNotification(`Offer Rejected`, {
            body: `Unfortunately, your recent offer was not accepted.`,
            type: 'offer'
        });
    }, [offers, sendNotification]);

    const withdrawOffer = useCallback(async (offerId: string) => {
        const updatedOffer = await api.updateOfferStatus(offerId, 'withdrawn');
        if (updatedOffer) {
            setOffers(prev => prev.map(o => o._id === offerId ? updatedOffer : o));
        }
    }, []);


    return (
        <OffersContext.Provider value={{ offers, makeOffer, acceptOffer, rejectOffer, withdrawOffer }}>
            {children}
        </OffersContext.Provider>
    );
};

export const useOffers = (): OffersContextType => {
    const context = useContext(OffersContext);
    if (context === undefined) {
        throw new Error('useOffers must be used within a OffersProvider');
    }
    return context;
};
