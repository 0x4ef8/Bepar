import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../hooks/useAuth';
import { XMarkIcon } from '../Icons';

interface WithdrawModalProps {
    onClose: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { withdrawFunds } = useWallet();
    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: user ? `${user.firstName} ${user.lastName}` : '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = Number(amount);
        if (withdrawAmount > 0 && user && withdrawAmount <= user.walletBalance) {
            withdrawFunds(withdrawAmount, bankDetails);
            onClose();
        } else {
            alert("Please enter a valid amount within your balance.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds</h2>
                    <p className="mt-2 text-gray-600">Transfer money from your wallet to a bank account.</p>
                </div>

                <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit}>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Withdraw (NPR)</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">रू</span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                max={user?.walletBalance}
                                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="e.g., 5000"
                            />
                        </div>
                         <p className="text-xs text-gray-500 mt-1">Available balance: रू{user?.walletBalance.toLocaleString('en-NP')}</p>
                    </div>
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input type="text" name="accountHolder" value={bankDetails.accountHolder} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Submit Withdrawal Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawModal;