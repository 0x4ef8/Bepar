import React, { useState, useMemo } from 'react';
import type { Listing, User, Review } from '../../types';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useListings } from '../hooks/useListings';
import { useWallet } from '../hooks/useWallet';
import { useUsers } from '../hooks/useUsers';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, CheckBadgeIcon, StarIcon, ShieldCheckIcon, HeartIcon, MapPinIcon, TagIcon } from './Icons';
import { timeSince } from '../../utils/timeSince';
import MakeOfferModal from './modals/MakeOfferModal';
import LocationAssistant from './LocationAssistant';

interface ProductDetailProps {
    listing: Listing;
    onBack: () => void;
    onChat: (sellerId: string) => void;
    onOpenKyc: () => void;
    onViewProfile: (user: User) => void;
}

const calculateAverageRating = (reviews?: Review[]) => {
    if (!reviews || reviews.length === 0) {
        return "No ratings";
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
};

const CommentSection: React.FC<{ listing: Listing }> = ({ listing }) => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { addCommentToListing } = useListings();
    const [commentText, setCommentText] = useState('');

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            addCommentToListing(listing._id, commentText);
            setCommentText('');
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments ({listing.comments?.length || 0})</h2>
            <div className="space-y-4">
                {listing.comments?.map(comment => {
                    const author = users.find(u => u._id === comment.authorId);
                    if (!author) return null;
                    const authorFullName = `${author.firstName} ${author.lastName}`;
                    return (
                        <div key={comment._id} className="flex items-start gap-3">
                            <img src={author.photo} alt={authorFullName} className="w-10 h-10 rounded-full" />
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-gray-800">{authorFullName}</p>
                                    <p className="text-xs text-gray-500">{timeSince(comment.timestamp)}</p>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            {user?.isVerified && (
                <form onSubmit={handleSubmitComment} className="mt-6 flex items-start gap-3">
                    <img src={user.photo} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <textarea
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            maxLength={100}
                            placeholder="Add a comment..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={2}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">{100 - commentText.length} characters remaining</span>
                            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300" disabled={!commentText.trim()}>
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};


const ProductDetail: React.FC<ProductDetailProps> = ({ listing, onBack, onChat, onOpenKyc, onViewProfile }) => {
    const { user, isSaved, toggleSaveItem } = useAuth();
    const { users } = useUsers();
    const { sendNotification } = useNotifications();
    const { initiatePurchase } = useWallet();
    const [mainImage, setMainImage] = useState(listing.images[0]);
    const [isOfferModalOpen, setOfferModalOpen] = useState(false);
    
    const seller = useMemo(() => users.find(u => u._id === listing.sellerId), [users, listing.sellerId]);
    const saved = isSaved(listing._id);

    const handlePrimaryAction = () => {
        if (!user) return;
        if (!user.isVerified) {
            onOpenKyc();
            return;
        }

        if (listing.priceType === 'negotiable') {
            setOfferModalOpen(true);
        } else {
            // Fixed price: Buy Now
            initiatePurchase(listing, listing.price);
            sendNotification('Purchase Initiated!', {
                body: `Your payment for "${listing.title}" is now held in escrow.`,
                type: 'transaction'
            });
            onBack();
        }
    };

    if (!seller) {
        return <div>Seller not found.</div>;
    }
    
    const sellerFullName = `${seller.firstName} ${seller.lastName}`;
    const averageRating = calculateAverageRating(seller.reviews);

    const isOwnListing = user?._id === listing.sellerId;
    const isSold = listing.status !== 'available';

    const latestReview = seller.reviews
        ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const reviewAuthor = latestReview ? users.find(u => u._id === latestReview.authorId) : null;
    
    const conditionText = {
        'new': 'New',
        'like-new': 'Like New',
        'used': 'Used',
        'for-parts': 'For Parts / Not Working'
    };


    return (
        <>
        {isOfferModalOpen && <MakeOfferModal listing={listing} onClose={() => setOfferModalOpen(false)} />}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Listings
            </button>

            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="p-4">
                        <img src={mainImage} alt={listing.title} className="w-full h-96 object-cover rounded-lg shadow-md mb-4"/>
                        <div className="flex space-x-2">
                            {listing.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    onClick={() => setMainImage(img)}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-gray-500 uppercase">{listing.category}</p>
                                        {listing.condition && (
                                            <>
                                                <span className="text-gray-300">&bull;</span>
                                                <p className="text-sm font-semibold text-gray-600">{conditionText[listing.condition]}</p>
                                            </>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 my-2">{listing.title}</h1>
                                    <p className="text-xs text-gray-500">Posted {timeSince(listing.createdAt)}</p>
                                     {listing.distance && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <MapPinIcon className="w-3 h-3 mr-1" />
                                            Approximately {listing.distance.toFixed(1)} km away
                                        </p>
                                    )}
                                </div>
                                <button 
                                    onClick={() => toggleSaveItem(listing._id)}
                                    className="p-3 rounded-full hover:bg-red-50 transition-colors"
                                    title={saved ? "Unsave item" : "Save for later"}
                                >
                                    <HeartIcon className={`w-7 h-7 transition-colors ${saved ? 'text-red-500 fill-current' : 'text-gray-500 hover:text-red-400'}`} />
                                </button>
                            </div>
                            <div className="flex items-baseline gap-3 my-4">
                                <p className="text-3xl font-light text-primary">रू{listing.price.toLocaleString('en-NP')}</p>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    listing.priceType === 'negotiable' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                    {listing.priceType === 'negotiable' ? 'Negotiable' : 'Fixed Price'}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                        </div>
                        
                        <div className="mt-6">
                            {/* Seller Info */}
                            <div onClick={() => onViewProfile(seller)} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                <p className="font-semibold mb-3">Seller Information</p>
                                <div className="flex items-center mb-4">
                                    <img src={seller.photo} alt={sellerFullName} className="w-12 h-12 rounded-full"/>
                                    <div className="ml-4">
                                        <p className="font-bold text-gray-800 flex items-center">
                                            {sellerFullName}
                                            {seller.isVerified && <CheckBadgeIcon className="w-5 h-5 text-secondary ml-2" title="Verified Seller"/>}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <StarIcon className="w-4 h-4 text-yellow-500" />
                                            <span className="font-bold">{averageRating}</span>
                                            <span className="text-gray-500">{typeof averageRating === 'string' ? '' : '/ 5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Feedback</h4>
                                    {latestReview && reviewAuthor ? (
                                        <div className="mt-2 border-l-2 border-secondary pl-3">
                                            <p className="text-sm italic text-gray-700">"{latestReview.text}"</p>
                                            <p className="text-xs text-gray-500 text-right mt-1">- {reviewAuthor.firstName} {reviewAuthor.lastName}</p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">No recent feedback available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => onChat(listing.sellerId)}
                                    disabled={isOwnListing}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                                    Chat with Seller
                                </button>
                                <button
                                    onClick={handlePrimaryAction}
                                    disabled={isOwnListing || isSold}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {listing.priceType === 'negotiable' 
                                        ? <><TagIcon className="w-5 h-5"/> {isSold ? `Item ${listing.status}` : 'Make an Offer'}</>
                                        : <><ShieldCheckIcon className="w-5 h-5"/> {isSold ? `Item ${listing.status}` : 'Buy Now with Escrow'}</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
                <CommentSection listing={listing} />
            </div>
            <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Seller Reviews</h2>
                <div className="space-y-4">
                    {(seller.reviews && seller.reviews.length > 0) ? seller.reviews.map(review => {
                        const author = users.find(u => u._id === review.authorId);
                        if (!author) return null;
                        const authorFullName = `${author.firstName} ${author.lastName}`;
                        return (
                            <div key={review._id} className="flex items-start gap-3">
                                <img src={author.photo} alt={authorFullName} className="w-10 h-10 rounded-full" />
                                <div className="bg-gray-100 p-3 rounded-lg flex-1 border">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm text-gray-800">{authorFullName}</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold">{review.rating}.0</span>
                                            <StarIcon className="w-4 h-4 text-yellow-500" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{review.text}</p>
                                     <p className="text-xs text-gray-400 text-right mt-1">{timeSince(review.timestamp)}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 py-4">This seller has no reviews yet.</p>
                    )}
                </div>
            </div>
            <div className="mt-8">
                <LocationAssistant listing={listing} />
            </div>
        </div>
        </>
    );
};

export default ProductDetail;