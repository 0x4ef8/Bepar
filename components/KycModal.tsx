import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowUpTrayIcon, CameraIcon, XMarkIcon, CalendarIcon, BriefcaseIcon, BuildingOffice2Icon } from './Icons';
import type { Address } from '../../types';

interface KycModalProps {
    onClose: () => void;
}

const KycModal: React.FC<KycModalProps> = ({ onClose }) => {
    const { user, verifyUser } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        dob: '',
        occupation: '',
        address: {
            state: 'Bagmati',
            district: '',
            municipality: '',
            ward: ''
        }
    });
    // States to simulate interaction
    const [docUploaded, setDocUploaded] = useState(false);
    const [selfieTaken, setSelfieTaken] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('Verifying your identity...');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            }
        }));
    };

    const handleVerification = () => {
        verifyUser(formData as { email: string, dob: string, occupation: string, address: Address });
        onClose();
        alert('KYC Verification Successful! You can now trade.');
    };
    
    const startProcessing = () => {
        setStep(5); // Move to processing screen
        setTimeout(() => setProcessingStatus("Submitting to VeriID..."), 1000);
        setTimeout(() => setProcessingStatus("Analyzing biometrics..."), 2500);
        setTimeout(() => setProcessingStatus("Verification complete!"), 4000);
        setTimeout(handleVerification, 4500);
    };
    
    const isStep1Valid = formData.email && formData.dob && formData.occupation;
    const isStep2Valid = formData.address.state && formData.address.district && formData.address.municipality && formData.address.ward;

    const renderStepContent = () => {
        switch (step) {
            case 1: // Personal Details
                return (
                    <>
                        <p className="mt-2 text-gray-600">First, let's get some basic information.</p>
                        <form className="mt-8 space-y-4 text-left">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative mt-1">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <div className="relative mt-1">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
                                <div className="relative mt-1">
                                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select name="occupation" id="occupation" value={formData.occupation} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                        <option value="" disabled>Select an occupation</option>
                                        <option>Student</option>
                                        <option>Employed</option>
                                        <option>Business Owner</option>
                                        <option>Unemployed</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </>
                );
            case 2: // Address
                return (
                     <>
                        <p className="mt-2 text-gray-600">Please provide your permanent address as per your documents.</p>
                        <form className="mt-8 space-y-4 text-left">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <select name="state" id="state" value={formData.address.state} onChange={handleAddressChange} required className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                    <option>Bagmati</option>
                                    <option>Gandaki</option>
                                    <option>Lumbini</option>
                                    <option>Karnali</option>
                                    <option>Sudurpashchim</option>
                                    <option>Province 1</option>
                                    <option>Madhesh</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
                                    <input type="text" name="district" id="district" value={formData.address.district} onChange={handleAddressChange} required className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                 <div>
                                    <label htmlFor="municipality" className="block text-sm font-medium text-gray-700">Municipality</label>
                                    <input type="text" name="municipality" id="municipality" value={formData.address.municipality} onChange={handleAddressChange} required className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Ward No.</label>
                                <input type="text" name="ward" id="ward" value={formData.address.ward} onChange={handleAddressChange} required className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                        </form>
                    </>
                )
            case 3: // Document Upload
                return (
                     <>
                        <p className="mt-2 text-gray-600">Please upload a government-issued photo ID. This is handled securely by our partner <span className="font-semibold text-primary">VeriID</span>.</p>
                        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400"/>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Upload National ID / Passport</h3>
                            <p className="mt-1 text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            <button onClick={() => setDocUploaded(true)} className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-primary hover:bg-gray-50">
                                {docUploaded ? 'File Selected!' : 'Select file'}
                            </button>
                        </div>
                    </>
                );
            case 4: // Face Verification
                 return (
                     <>
                        <p className="mt-2 text-gray-600">We need a quick selfie with liveness detection to compare with your ID.</p>
                        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <CameraIcon className="w-12 h-12 mx-auto text-gray-400"/>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Live Face Verification</h3>
                            <p className="mt-1 text-sm text-gray-500">Please follow on-screen instructions: blink, smile, and turn your head slowly.</p>
                             <button onClick={() => setSelfieTaken(true)} className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-primary hover:bg-gray-50">
                                {selfieTaken ? 'Selfie Captured!' : 'Open Camera'}
                            </button>
                        </div>
                    </>
                );
            case 5: // Processing
                return (
                    <div className="text-center p-8">
                         <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                         <h3 className="mt-4 text-lg font-medium text-gray-900">{processingStatus}</h3>
                         <p className="mt-1 text-sm text-gray-500">This should only take a moment.</p>
                    </div>
                );
            default: return null;
        }
    };
    
    const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
        const stepNames = ["Personal Details", "Address", "Document Upload", "Face Verification"];
        return (
            <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700">Step {currentStep} of {totalSteps}: <span className="text-primary">{stepNames[currentStep-1]}</span></p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Identity Verification (KYC)</h2>
                </div>
                
                <div className="mt-6">
                    {step < 5 && <StepIndicator currentStep={step} totalSteps={4} />}
                    {renderStepContent()}
                </div>

                {step < 5 && (
                    <div className="mt-8 flex justify-between gap-4">
                        {step > 1 && (
                             <button onClick={() => setStep(s => s - 1)} className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors">
                                Back
                            </button>
                        )}
                        
                        <button 
                            onClick={() => setStep(s => s + 1)} 
                            disabled={
                                (step === 1 && !isStep1Valid) ||
                                (step === 2 && !isStep2Valid) ||
                                (step === 3 && !docUploaded) ||
                                (step === 4 && !selfieTaken)
                            }
                            className={`w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${step > 1 ? '' : 'ml-auto'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        >
                            {step === 4 ? 'Submit for Verification' : 'Next'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KycModal;