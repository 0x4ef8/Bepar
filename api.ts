import { MOCK_LISTINGS, MOCK_USERS, MOCK_TRANSACTIONS, MOCK_OFFERS, MOCK_REVIEWS, MOCK_COMMENTS } from './constants';
import type { User, Listing, Transaction, Offer, Review, Comment, ListingCondition } from './types';

const SIMULATED_DELAY = 500; // ms
const PAGE_SIZE = 8;

// --- In-memory database simulation ---
let listings: Listing[] = JSON.parse(JSON.stringify(MOCK_LISTINGS));
let users: User[] = JSON.parse(JSON.stringify(MOCK_USERS));
let transactions: Transaction[] = JSON.parse(JSON.stringify(MOCK_TRANSACTIONS));
let offers: Offer[] = JSON.parse(JSON.stringify(MOCK_OFFERS));
// ---

function simulateApiCall<T>(data: T, delay = SIMULATED_DELAY): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data)));
        }, delay);
    });
}

export const api = {
    // Read operations
    fetchListings: (page: number = 1): Promise<{ data: Listing[], hasMore: boolean, total: number }> => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const data = listings.slice(start, end);
        const hasMore = end < listings.length;
        return simulateApiCall({ data, hasMore, total: listings.length });
    },
    fetchUsers: (): Promise<User[]> => simulateApiCall(users),
    fetchTransactions: (): Promise<Transaction[]> => simulateApiCall(transactions),
    fetchOffers: (): Promise<Offer[]> => simulateApiCall(offers),

    // Write operations
    createUser: (newUser: User): Promise<User> => {
        users.push(newUser);
        return simulateApiCall(newUser);
    },
    uploadImage: (file: File): Promise<{ url: string }> => {
        console.log(`Simulating upload for file: ${file.name}`);
        // In a real app, this would upload to Cloudinary/S3 and return the URL
        const randomImageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`;
        return simulateApiCall({ url: randomImageUrl }, 1500); // Simulate network delay
    },
    addListing: (newListing: Listing): Promise<Listing> => {
        listings = [newListing, ...listings];
        return simulateApiCall(newListing);
    },
    updateListing: (listingId: string, updatedData: Partial<Omit<Listing, '_id'>>): Promise<Listing | null> => {
        let updatedListing: Listing | null = null;
        listings = listings.map(l => {
            if (l._id === listingId) {
                updatedListing = { ...l, ...updatedData };
                return updatedListing;
            }
            return l;
        });
        return simulateApiCall(updatedListing);
    },
    deleteListing: (listingId: string): Promise<{ success: boolean }> => {
        listings = listings.filter(l => l._id !== listingId);
        return simulateApiCall({ success: true });
    },
    addCommentToListing: (listingId: string, newComment: Comment): Promise<Comment> => {
         listings = listings.map(l => {
            if (l._id === listingId) {
                return { ...l, comments: [...(l.comments || []), newComment] };
            }
            return l;
        });
        return simulateApiCall(newComment);
    },
    addReview: (targetUserId: string, newReview: Review): Promise<Review> => {
        users = users.map(u => {
            if (u._id === targetUserId) {
                return { ...u, reviews: [newReview, ...(u.reviews || [])] };
            }
            return u;
        });
        return simulateApiCall(newReview);
    },
    makeOffer: (newOffer: Offer): Promise<Offer> => {
        offers = [newOffer, ...offers];
        return simulateApiCall(newOffer);
    },
    updateOfferStatus: (offerId: string, status: Offer['status']): Promise<Offer | null> => {
        let updatedOffer: Offer | null = null;
        offers = offers.map(o => {
            if (o._id === offerId) {
                updatedOffer = { ...o, status };
                return updatedOffer;
            }
            return o;
        });
        return simulateApiCall(updatedOffer);
    },
    addTransaction: (newTransaction: Transaction): Promise<Transaction> => {
        transactions = [newTransaction, ...transactions];
        return simulateApiCall(newTransaction);
    },
    updateTransactionStatus: (transactionId: string, status: Transaction['status']): Promise<Transaction | null> => {
        let updatedTx: Transaction | null = null;
        transactions = transactions.map(t => {
            if (t._id === transactionId) {
                updatedTx = { ...t, status };
                
                // When payment is released, update seller's balance in our simulated DB
                if (status === 'released') {
                    users = users.map(user => {
                        if (user._id === t.sellerId) {
                            return { ...user, walletBalance: user.walletBalance + t.amount };
                        }
                        return user;
                    });
                }

                return updatedTx;
            }
            return t;
        });
        return simulateApiCall(updatedTx);
    }
};