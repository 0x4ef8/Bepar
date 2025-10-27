
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InformationCircleIcon, XMarkIcon } from './Icons';

interface WelcomeBannerProps {
    onOpenKyc: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onOpenKyc }) => {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);

    if (!user || !isVisible) return null;

    const needsKyc = !user.isVerified;

    return (
        <div className="bg-primary/10 border-l-4 border-primary text-primary-dark p-4 rounded-r-lg mb-6 relative shadow">
            <div className="flex">
                <div className="py-1">
                    <InformationCircleIcon className="w-6 h-6 text-primary mr-4" />
                </div>
                <div>
                    <p className="font-bold">Welcome back, {user.firstName}!</p>
                    {needsKyc ? (
                        <>
                            <p className="text-sm">Complete your profile to start buying and selling safely.</p>
                            <button 
                                onClick={onOpenKyc} 
                                className="mt-2 text-sm font-semibold text-primary underline hover:no-underline"
                            >
                                Complete Verification Now &rarr;
                            </button>
                        </>
                    ) : (
                        <p className="text-sm">Ready to discover great deals? Start exploring below.</p>
                    )}
                </div>
            </div>
            <button 
                onClick={() => setIsVisible(false)} 
                className="absolute top-2 right-2 p-1 text-primary/60 hover:text-primary"
            >
                <XMarkIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};

export default WelcomeBanner;