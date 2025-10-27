import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Transaction, Listing } from '../types';
import { api } from '../api';
import { useAuth } from './useAuth';
import { useListings } from './useListings';
import { useUsers } from './useUsers';

interface WalletContextType {
    transactions: Transaction[];
    initiatePurchase: (listing: Listing, price: number) => Promise<void>;
    confirmDelivery: (transactionId: string) => Promise<void>;
    depositFunds: (amount: number) => void;
    withdrawFunds: (amount: number, bankDetails: any) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// This is a workaround because useListings cannot be called inside WalletProvider
// as it is not a descendant. We need a way to call updateListing.
// A better solution in a larger app would be a global state manager like Redux.
let _updateListing: (listingId: string, updatedData: Partial<Omit<Listing, '_id'>>) => Promise<void>;

const ListingUpdater = () => {
    const { updateListing } = useListings();
    _updateListing = updateListing;
    return null;
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateBalance } = useAuth();
    const { updateUserBalance } = useUsers();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        api.fetchTransactions().then(data => {
            setTransactions(data);
        });
    }, []);
    
    const initiatePurchase = useCallback(async (listing: Listing, price: number) => {
        if (!user || user.walletBalance < price) {
            alert("Insufficient funds or not logged in.");
            return;
        }
        
        updateBalance(user.walletBalance - price);
        
        const newTransaction: Transaction = {
            _id: `tx${Date.now()}`,
            buyerId: user._id,
            sellerId: listing.sellerId,
            itemId: listing._id,
            amount: price,
            status: 'escrow_held',
            createdAt: new Date().toISOString(),
        };
        
        const addedTransaction = await api.addTransaction(newTransaction);
        setTransactions(prev => [addedTransaction, ...prev]);
        
        if (_updateListing) {
            await _updateListing(listing._id, { status: 'pending' });
        }
        
        console.log(`Purchase initiated for ${listing.title}. Amount ${price} held in escrow.`);
    }, [user, updateBalance]);

    const confirmDelivery = useCallback(async (transactionId: string) => {
        const tx = transactions.find(t => t._id === transactionId);
        if (!tx || !user || tx.buyerId !== user._id) {
            console.error("Transaction not found or user is not the buyer.");
            return;
        }
        
        const updatedTx = await api.updateTransactionStatus(transactionId, 'released');
        if (updatedTx) {
            setTransactions(prev => prev.map(t => t._id === transactionId ? updatedTx : t));
            // This is the key change: update the seller's balance in the frontend state
            updateUserBalance(tx.sellerId, tx.amount);
        }

        if (_updateListing) {
            await _updateListing(tx.itemId, { status: 'sold' });
        }
        
        console.log(`Funds worth ${tx.amount} released to seller ${tx.sellerId}.`);
        alert(`Delivery confirmed! Payment has been released to the seller.`);

    }, [transactions, user, updateUserBalance]);

    const depositFunds = useCallback((amount: number) => {
        if (!user || amount <= 0) return;
        updateBalance(user.walletBalance + amount);
        alert(`Successfully deposited रू${amount.toLocaleString('en-NP')}.`);
    }, [user, updateBalance]);
    
    const withdrawFunds = useCallback((amount: number, bankDetails: any) => {
        if (!user || amount <= 0 || amount > user.walletBalance) {
            alert("Invalid amount or insufficient balance.");
            return;
        }
        updateBalance(user.walletBalance - amount);
        alert(`Withdrawal request for रू${amount.toLocaleString('en-NP')} submitted. It will be processed within 3 business days.`);
        console.log("Withdrawal Request:", { amount, ...bankDetails });
    }, [user, updateBalance]);

    return (
        <WalletContext.Provider value={{ transactions, initiatePurchase, confirmDelivery, depositFunds, withdrawFunds }}>
            <ListingUpdater />
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};