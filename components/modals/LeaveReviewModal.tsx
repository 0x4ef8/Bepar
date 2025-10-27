import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { useListings } from '../../hooks/useListings';
import { XMarkIcon, StarIcon, StarIconOutline } from '../Icons';
import type { Transaction } from '../../types';

interface LeaveReviewModalProps {
    transaction: Transaction;
    onClose: () => void;
}

const StarRatingInput: React.FC<{ rating: number, setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-yellow-400 hover:text-yellow-500 transition-transform transform hover:scale-110"
                >
                    {star <= rating ? (
                        <StarIcon className="w-10 h-10" />
                    ) : (
                        <StarIconOutline className="w-10 h-10" />
                    )}
                </button>
            ))}
        </div>
    );
};


const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ transaction, onClose }) => {
    const { user } = useAuth();
    const { addReview } = useUsers();
    const { listings } = useListings();
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const item = listings.find(l => l._id === transaction.itemId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        if (!user) {
            alert("You must be logged in to leave a review.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            await addReview(transaction.sellerId, {
                authorId: user._id,
                listingId: transaction.itemId,
                transactionId: transaction._id,
                rating,
                text: comment
            });
            
            alert("Thank you for your feedback!");
            onClose();
        } catch (error) {
            console.error("Failed to submit review", error);
            alert("There was an error submitting your review.");
            setIsSubmitting(false);
        }
    };
    
    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
                    <p className="mt-2 text-gray-600">Share your experience for the purchase of <span className="font-semibold">{item.title}</span>.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-center font-medium text-gray-700 mb-2">Your Overall Rating</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                     <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a written review (optional)</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={250}
                            placeholder="Describe your experience with the seller and the item."
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                         <p className="text-xs text-gray-500 text-right mt-1">{250 - comment.length} characters left</p>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-300"
                            disabled={rating === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveReviewModal;
