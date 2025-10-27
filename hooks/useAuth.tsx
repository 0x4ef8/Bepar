import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, Address } from '../types';
import { MOCK_USERS } from '../constants';
import { api } from '../api';

type AuthStep = 'phone' | 'name' | 'otp';

interface KycDetails {
    email: string;
    dob: string;
    occupation: string;
    address: Address;
}

interface AuthContextType {
    user: User | null;
    authStep: AuthStep;
    isLoading: boolean;
    authError: string | null;
    phoneNumber: string;
    checkPhoneAndSendOtp: (phone: string) => Promise<void>;
    submitNamesAndSendOtp: (firstName: string, lastName: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    logout: () => void;
    verifyUser: (details: KycDetails) => void;
    updateUser: (updatedInfo: Partial<User>) => void;
    updateBalance: (newBalance: number) => void;
    isSaved: (listingId: string) => boolean;
    toggleSaveItem: (listingId: string) => void;
    resetAuthFlow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authStep, setAuthStep] = useState<AuthStep>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [newUserNames, setNewUserNames] = useState<{ firstName: string; lastName: string } | null>(null);

    const checkPhoneAndSendOtp = useCallback(async (phone: string) => {
        setIsLoading(true);
        setAuthError(null);
        setPhoneNumber(phone);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate checking user
        
        const existingUser = MOCK_USERS.find(u => u.phone.includes(phone.slice(-10)));

        if (existingUser) {
            // User exists, proceed to OTP verification
            console.log(`Simulating OTP request for existing user: ${phone}`);
            setAuthStep('otp');
        } else {
            // New user, ask for name
            console.log(`New user detected for phone: ${phone}`);
            setAuthStep('name');
        }
        setIsLoading(false);
    }, []);

    const submitNamesAndSendOtp = useCallback(async (firstName: string, lastName: string) => {
        setIsLoading(true);
        setAuthError(null);
        setNewUserNames({ firstName, lastName });
        console.log(`Simulating OTP request for new user: ${phoneNumber}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAuthStep('otp');
        setIsLoading(false);
    }, [phoneNumber]);

    const verifyOtp = useCallback(async (otp: string) => {
        setIsLoading(true);
        setAuthError(null);
        console.log(`Simulating OTP verification with OTP: ${otp}`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (otp === '123456' && phoneNumber) {
            if (newUserNames) { // Signup flow
                const newUser: User = {
                    _id: `user${Date.now()}`,
                    firstName: newUserNames.firstName,
                    lastName: newUserNames.lastName,
                    phone: phoneNumber,
                    photo: `https://picsum.photos/seed/user${Date.now()}/200/200`,
                    isVerified: false,
                    kycStatus: 'unverified',
                    walletBalance: 0,
                    location: { lat: 27.7, lng: 85.3 }, // Default location
                    joinedAt: new Date().toISOString(),
                };
                const createdUser = await api.createUser(newUser);
                setUser(createdUser);
            } else { // Signin flow
                const existingUser = MOCK_USERS.find(u => u.phone.includes(phoneNumber.slice(-10)));
                setUser(existingUser || null);
            }
            // Reset flow
            setAuthStep('phone');
            setPhoneNumber('');
            setNewUserNames(null);
        } else {
            setAuthError('Invalid OTP. Please try again.');
        }
        setIsLoading(false);
    }, [phoneNumber, newUserNames]);
    
    const resetAuthFlow = useCallback(() => {
        setAuthStep('phone');
        setPhoneNumber('');
        setNewUserNames(null);
        setAuthError(null);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        resetAuthFlow();
    }, [resetAuthFlow]);

    const verifyUser = useCallback((details: KycDetails) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return {
                ...currentUser,
                ...details,
                occupation: details.occupation as User['occupation'],
                isVerified: true,
                kycStatus: 'verified',
            };
        });
    }, []);
    
    const updateUser = useCallback((updatedInfo: Partial<User>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, ...updatedInfo };
        });
    }, []);

    const updateBalance = useCallback((newBalance: number) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, walletBalance: newBalance };
        });
    }, []);

    const isSaved = useCallback((listingId: string) => {
        return user?.savedItems?.includes(listingId) ?? false;
    }, [user]);

    const toggleSaveItem = useCallback((listingId: string) => {
        setUser(currentUser => {
            if (!currentUser) return null;

            const currentSavedItems = currentUser.savedItems || [];
            const isCurrentlySaved = currentSavedItems.includes(listingId);

            const savedItems = isCurrentlySaved
                ? currentSavedItems.filter(id => id !== listingId)
                : [...currentSavedItems, listingId];
            
            return {
                ...currentUser,
                savedItems,
            };
        });
    }, []);

    const value = {
        user,
        authStep,
        isLoading,
        authError,
        phoneNumber,
        checkPhoneAndSendOtp,
        submitNamesAndSendOtp,
        verifyOtp,
        logout,
        verifyUser,
        updateUser,
        updateBalance,
        isSaved,
        toggleSaveItem,
        resetAuthFlow,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};