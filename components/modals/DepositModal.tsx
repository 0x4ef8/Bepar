import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { XMarkIcon } from '../Icons';

interface DepositModalProps {
    onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
    const { depositFunds } = useWallet();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('esewa');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const depositAmount = Number(amount);
        if (depositAmount > 0) {
            depositFunds(depositAmount);
            onClose();
        } else {
            alert("Please enter a valid amount.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Deposit Funds</h2>
                    <p className="mt-2 text-gray-600">Add money to your wallet securely.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (NPR)</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">रू</span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="e.g., 5000"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <div className="mt-2 space-y-2">
                           <div onClick={() => setPaymentMethod('esewa')} className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'esewa' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}`}>
                                <input type="radio" name="paymentMethod" value="esewa" checked={paymentMethod === 'esewa'} readOnly className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                <img src="https://logowik.com/content/uploads/images/esewa-payment-gateway-nepal4295.jpg" alt="eSewa" className="h-6 ml-3" />
                           </div>
                            <div onClick={() => setPaymentMethod('khalti')} className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'khalti' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}`}>
                                <input type="radio" name="paymentMethod" value="khalti" checked={paymentMethod === 'khalti'} readOnly className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                <img src="https://logowik.com/content/uploads/images/khalti-digital-wallet-payment-gateway-nepal2433.logowik.com.webp" alt="Khalti" className="h-6 ml-3" />
                           </div>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepositModal;