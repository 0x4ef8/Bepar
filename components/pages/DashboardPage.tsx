import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { useWallet } from '../../hooks/useWallet';
import { useUsers } from '../../hooks/useUsers';
import { useOffers } from '../../hooks/useOffers';
import { timeSince } from '../../utils/timeSince';
import { CurrencyDollarIcon, ListBulletIcon, CheckBadgeIcon, ArrowUpCircleIcon, TagIcon, ClockIcon } from '../Icons';
import type { Transaction, User, Offer } from '../../types';
import LeaveReviewModal from '../modals/LeaveReviewModal';

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const OfferStatusBadge: React.FC<{ status: Offer['status'] }> = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full";
    switch (status) {
        case 'pending': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
        case 'accepted': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Accepted</span>;
        case 'rejected': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
        case 'withdrawn': return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Withdrawn</span>;
        default: return null;
    }
};


const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { users } = useUsers();
    const { listings } = useListings();
    const { transactions, confirmDelivery, initiatePurchase } = useWallet();
    const { offers, acceptOffer, rejectOffer, withdrawOffer } = useOffers();
    const [reviewingTx, setReviewingTx] = useState<Transaction | null>(null);

    if (!user) return null;

    const userListings = listings.filter(l => l.sellerId === user._id);
    const activeListings = userListings.filter(l => l.status === 'available');
    const soldListings = userListings.filter(l => l.status === 'sold');
    const totalRevenue = transactions
        .filter(t => t.sellerId === user._id && t.status === 'released')
        .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = transactions
        .filter(t => t.sellerId === user._id || t.buyerId === user._id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
        
    const activeOrders = transactions.filter(t => t.buyerId === user._id && t.status === 'escrow_held');
    const pendingSales = transactions.filter(t => t.sellerId === user._id && t.status === 'escrow_held');
    
    const hasUserReviewed = (tx: Transaction) => {
        const seller = users.find(u => u._id === tx.sellerId);
        return seller?.reviews?.some(review => review.transactionId === tx._id && review.authorId === user._id);
    };

    const offersMade = offers.filter(o => o.buyerId === user._id);
    const offersReceived = offers.filter(o => o.sellerId === user._id);
    
    const handlePayForOffer = (offer: Offer) => {
        const listing = listings.find(l => l._id === offer.listingId);
        if (listing) {
            initiatePurchase(listing, offer.amount);
        }
    };

    return (
        <>
            {reviewingTx && (
                <LeaveReviewModal 
                    transaction={reviewingTx}
                    onClose={() => setReviewingTx(null)}
                />
            )}
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">My Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Listings" value={userListings.length} icon={<ListBulletIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
                    <StatCard title="Active Listings" value={activeListings.length} icon={<CheckBadgeIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
                    <StatCard title="Items Sold" value={soldListings.length} icon={<CurrencyDollarIcon className="w-6 h-6 text-white"/>} color="bg-yellow-500" />
                    <StatCard title="Total Revenue" value={`रू${totalRevenue.toLocaleString('en-NP')}`} icon={<ArrowUpCircleIcon className="w-6 h-6 text-white"/>} color="bg-purple-500" />
                </div>

                {activeOrders.length > 0 && (
                     <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Action Required: My Active Orders</h3>
                        <div className="space-y-4">
                            {activeOrders.map(tx => {
                                const item = listings.find(l => l._id === tx.itemId);
                                if (!item) return null;
                                return (
                                    <div key={tx._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                        <div className="flex items-center">
                                            <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded-md" />
                                            <div className="ml-4">
                                                <p className="font-semibold">Confirm delivery for: {item.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    Paid रू{tx.amount.toLocaleString('en-NP')}. Funds are in escrow.
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => confirmDelivery(tx._id)}
                                            className="mt-3 sm:mt-0 w-full sm:w-auto bg-secondary text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            Confirm Delivery & Release Payment
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {pendingSales.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ClockIcon className="w-6 h-6 text-blue-500" /> Pending Sales
                        </h3>
                        <div className="space-y-4">
                            {pendingSales.map(tx => {
                                const item = listings.find(l => l._id === tx.itemId);
                                const buyer = users.find(u => u._id === tx.buyerId);
                                if (!item || !buyer) return null;
                                return (
                                    <div key={tx._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                                        <div className="flex items-center">
                                            <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded-md" />
                                            <div className="ml-4">
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    Sold to {buyer.firstName} {buyer.lastName} for रू{tx.amount.toLocaleString('en-NP')}.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 text-center sm:text-right">
                                            <p className="text-sm font-semibold text-blue-700">Awaiting Buyer's Confirmation</p>
                                            <p className="text-xs text-gray-500">Deliver the item and wait for release.</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><TagIcon className="w-6 h-6"/> My Offers</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Offers I've Made ({offersMade.length})</h4>
                            <div className="space-y-3">
                                {offersMade.length > 0 ? offersMade.map(offer => {
                                    const item = listings.find(l => l._id === offer.listingId);
                                    return (
                                        <div key={offer._id} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-sm">{item?.title}</p>
                                                    <p className="text-sm text-gray-600">Offered: <span className="font-bold">रू{offer.amount.toLocaleString('en-NP')}</span></p>
                                                </div>
                                                <OfferStatusBadge status={offer.status} />
                                            </div>
                                            {offer.status === 'accepted' && (
                                                <button onClick={() => handlePayForOffer(offer)} className="mt-2 w-full text-sm bg-secondary text-white font-semibold py-1.5 rounded-md hover:bg-green-600">Pay Now</button>
                                            )}
                                            {offer.status === 'pending' && (
                                                <button onClick={() => withdrawOffer(offer._id)} className="mt-2 w-full text-sm bg-gray-200 text-gray-700 font-semibold py-1.5 rounded-md hover:bg-gray-300">Withdraw Offer</button>
                                            )}
                                        </div>
                                    )
                                }) : <p className="text-sm text-gray-500 text-center py-4">No offers made yet.</p>}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-700 mb-3">Offers I've Received ({offersReceived.length})</h4>
                            <div className="space-y-3">
                                 {offersReceived.length > 0 ? offersReceived.map(offer => {
                                    const item = listings.find(l => l._id === offer.listingId);
                                    const buyer = users.find(u => u._id === offer.buyerId);
                                    return (
                                        <div key={offer._id} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-sm">{item?.title}</p>
                                                    <p className="text-sm text-gray-600">Offer from {buyer?.firstName} {buyer?.lastName}: <span className="font-bold">रू{offer.amount.toLocaleString('en-NP')}</span></p>
                                                </div>
                                                <OfferStatusBadge status={offer.status} />
                                            </div>
                                            {offer.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => acceptOffer(offer._id)} className="flex-1 text-sm bg-green-500 text-white font-semibold py-1.5 rounded-md hover:bg-green-600">Accept</button>
                                                    <button onClick={() => rejectOffer(offer._id)} className="flex-1 text-sm bg-red-500 text-white font-semibold py-1.5 rounded-md hover:bg-red-600">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) : <p className="text-sm text-gray-500 text-center py-4">No offers received yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentTransactions.length > 0 ? recentTransactions.map(tx => {
                            const item = listings.find(l => l._id === tx.itemId);
                            const isSeller = tx.sellerId === user._id;
                            const otherParty = users.find(u => u._id === (isSeller ? tx.buyerId : tx.sellerId));
                            const otherPartyFullName = otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : 'Unknown User';
                            return (
                                <div key={tx._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <img src={item?.images[0]} alt={item?.title} className="w-12 h-12 object-cover rounded-md" />
                                        <div className="ml-4 flex-grow">
                                            <p className="font-semibold">{isSeller ? "Sale" : "Purchase"}: {item?.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {isSeller ? `Sold to ${otherPartyFullName}` : `Bought from ${otherPartyFullName}`} &bull; {timeSince(tx.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right mt-3 sm:mt-0 flex flex-col items-end">
                                        <p className={`font-bold ${isSeller ? 'text-green-600' : 'text-red-600'}`}>
                                            {isSeller ? '+' : '-'}रू{tx.amount.toLocaleString('en-NP')}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{tx.status.replace('_', ' ')}</p>
                                        {!isSeller && tx.status === 'released' && !hasUserReviewed(tx) && (
                                            <button 
                                                onClick={() => setReviewingTx(tx)}
                                                className="mt-2 text-sm font-semibold text-primary hover:underline"
                                            >
                                                Leave a Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-gray-500 py-8">No recent transactions.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;