import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LockClosedIcon, DevicePhoneMobileIcon, UserIcon } from '../Icons';

const LoginPage: React.FC = () => {
    const { 
        checkPhoneAndSendOtp,
        submitNamesAndSendOtp,
        verifyOtp,
        authStep, 
        isLoading, 
        authError,
        phoneNumber,
        resetAuthFlow,
    } = useAuth();
    
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        // Clear local state if auth flow is reset from context
        if (authStep === 'phone') {
            setPhone('');
            setFirstName('');
            setLastName('');
            setOtp('');
        }
    }, [authStep]);


    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await checkPhoneAndSendOtp(phone);
    };
    
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitNamesAndSendOtp(firstName, lastName);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await verifyOtp(otp);
    };

    const renderContent = () => {
        switch(authStep) {
            case 'name':
                return (
                    <form className="mt-8 space-y-6" onSubmit={handleNameSubmit}>
                         <p className="text-center text-sm text-gray-600">
                            Looks like you're new here! Let's create your account for <strong>{phoneNumber}</strong>.
                        </p>
                        <div className="space-y-4">
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input id="first-name" name="firstName" type="text" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} />
                            </div>
                             <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input id="last-name" name="lastName" type="text" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                                {isLoading ? 'Continuing...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                );
            case 'otp':
                return (
                    <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
                        <p className="text-center text-sm text-gray-600">
                            Enter the OTP sent to <strong>{phoneNumber}</strong>. <button onClick={resetAuthFlow} className="font-medium text-primary hover:text-blue-600">Change number</button>
                        </p>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input id="otp" name="otp" type="text" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Enter 6-digit OTP (try 123456)" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} disabled={isLoading} />
                        </div>
                         {authError && <p className="text-sm text-red-600 text-center">{authError}</p>}
                        <div>
                            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400">
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                        </div>
                    </form>
                );
            case 'phone':
            default:
                return (
                    <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
                        <div className="relative">
                            <DevicePhoneMobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input id="phone-number" name="phone" type="tel" autoComplete="tel" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                                {isLoading ? 'Checking...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                );
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">Welcome to Bepār</h1>
                    <p className="mt-2 text-gray-600">
                        {authStep === 'phone' && 'Sign in or create an account to continue.'}
                        {authStep === 'name' && 'Create your account.'}
                        {authStep === 'otp' && 'Verify your phone number.'}
                    </p>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default LoginPage;
