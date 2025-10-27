
import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '../Icons';

interface SignOutModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const SignOutModal: React.FC<SignOutModalProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Confirm Sign Out</h2>
                    <p className="mt-2 text-gray-600">Are you sure you want to sign out of your account?</p>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignOutModal;
