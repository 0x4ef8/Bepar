import React, { useState } from 'react';
import { useOffers } from '../../hooks/useOffers';
import { XMarkIcon, TagIcon } from '../Icons';
import type { Listing } from '../../types';

interface MakeOfferModalProps {
    listing: Listing;
    onClose: () => void;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ listing, onClose }) => {
    const { makeOffer } = useOffers();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const offerAmount = Number(amount);
        if (offerAmount <= 0) {
            alert("Please enter a valid offer amount.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            await makeOffer(listing, offerAmount);
            onClose();
        } catch (error) {
            console.error("Failed to make offer", error);
            alert("There was an error submitting your offer.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                        <TagIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Make an Offer</h2>
                    <p className="mt-2 text-gray-600">You are making an offer for <span className="font-semibold">{listing.title}</span>.</p>
                    <p className="text-sm text-gray-500">Listed Price: रू{listing.price.toLocaleString('en-NP')}</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Your Offer Amount (NPR)</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">रू</span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="e.g., 70000"
                            />
                        </div>
                         <p className="text-xs text-gray-500 mt-1">The seller will be notified of your offer.</p>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakeOfferModal;
