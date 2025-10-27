import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { useListings } from '../hooks/useListings';
import { useUsers } from '../hooks/useUsers';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from './Icons';

interface WalletProps {
    onDeposit: () => void;
    onWithdraw: () => void;
}

const Wallet: React.FC<WalletProps> = ({ onDeposit, onWithdraw }) => {
    const { user } = useAuth();
    const { transactions } = useWallet();
    const { listings } = useListings();
    const { users } = useUsers();

    if (!user) return null;

    const userTransactions = transactions.filter(t => t.buyerId === user._id || t.sellerId === user._id);

    const getTransactionDetails = (tx: typeof userTransactions[0]) => {
        const item = listings.find(l => l._id === tx.itemId);
        const isBuyer = tx.buyerId === user._id;
        const otherPartyId = isBuyer ? tx.sellerId : tx.buyerId;
        const otherParty = users.find(u => u._id === otherPartyId);
        return { item, isBuyer, otherParty };
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Wallet</h2>

            <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 rounded-xl shadow-lg mb-8">
                <p className="text-lg opacity-80">Current Balance</p>
                <p className="text-5xl font-bold tracking-tight">रू{user.walletBalance.toLocaleString('en-NP')}</p>
                <div className="flex gap-4 mt-6">
                    <button onClick={onDeposit} className="bg-white text-primary font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors">Deposit Funds</button>
                    <button onClick={onWithdraw} className="bg-blue-400 bg-opacity-50 text-white font-semibold px-6 py-2 rounded-full hover:bg-opacity-75 transition-colors">Withdraw</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h3>
                <div className="space-y-4">
                    {userTransactions.length > 0 ? userTransactions.map(tx => {
                        const { item, isBuyer, otherParty } = getTransactionDetails(tx);
                        return (
                            <div key={tx._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center">
                                    {isBuyer ? (
                                        <ArrowUpCircleIcon className="w-8 h-8 text-red-500" />
                                    ) : (
                                        <ArrowDownCircleIcon className="w-8 h-8 text-green-500" />
                                    )}
                                    <div className="ml-4">
                                        <p className="font-semibold">{item?.title || 'Item not found'}</p>
                                        <p className="text-sm text-gray-500">
                                            {/* FIX: Use firstName and lastName instead of non-existent name property. */}
                                            {isBuyer ? `To ${otherParty?.firstName} ${otherParty?.lastName}` : `From ${otherParty?.firstName} ${otherParty?.lastName}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${isBuyer ? 'text-red-600' : 'text-green-600'}`}>
                                        {isBuyer ? '-' : '+'}रू{tx.amount.toLocaleString('en-NP')}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{tx.status.replace('_', ' ')}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 py-8">No transactions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
