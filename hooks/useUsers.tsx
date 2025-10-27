import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, Review } from '../types';
import { api } from '../api';

interface UsersContextType {
    users: User[];
    addReview: (targetUserId: string, review: Omit<Review, '_id' | 'timestamp'>) => Promise<void>;
    updateUserBalance: (userId: string, amountToAdd: number) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        api.fetchUsers().then(data => {
            setUsers(data);
        });
    }, []);

    const addReview = useCallback(async (targetUserId: string, reviewData: Omit<Review, '_id' | 'timestamp'>) => {
        const newReview: Review = {
            ...reviewData,
            _id: `review-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        const addedReview = await api.addReview(targetUserId, newReview);

        setUsers(currentUsers => {
            return currentUsers.map(user => {
                if (user._id === targetUserId) {
                    const existingReviews = user.reviews || [];
                    return {
                        ...user,
                        reviews: [addedReview, ...existingReviews],
                    };
                }
                return user;
            });
        });
    }, []);

    const updateUserBalance = useCallback((userId: string, amountToAdd: number) => {
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user._id === userId
                    ? { ...user, walletBalance: user.walletBalance + amountToAdd }
                    : user
            )
        );
    }, []);

    return (
        <UsersContext.Provider value={{ users, addReview, updateUserBalance }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = (): UsersContextType => {
    const context = useContext(UsersContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UsersProvider');
    }
    return context;
};