import React, { useState } from 'react';
import { useListings } from '../../hooks/useListings';
import { XMarkIcon } from '../Icons';
import type { ListingCondition } from '../../types';

interface FiltersModalProps {
    onClose: () => void;
}

const conditionOptions: { value: 'any' | ListingCondition; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'used', label: 'Used' },
    { value: 'for-parts', label: 'For Parts' },
];

const FiltersModal: React.FC<FiltersModalProps> = ({ onClose }) => {
    const { setPriceRange, setCondition } = useListings();
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [selectedCondition, setSelectedCondition] = useState<'any' | ListingCondition>('any');

    const handleApplyFilters = () => {
        setPriceRange([minPrice, maxPrice]);
        setCondition(selectedCondition);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">More Filters</h2>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">Price Range</label>
                        <div className="mt-2">
                             <input
                                id="price-range"
                                type="range"
                                min="0"
                                max="100000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>रू0</span>
                            <span>रू{maxPrice.toLocaleString('en-NP')}</span>
                            <span>रू100,000+</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item Condition</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {conditionOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelectedCondition(value)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md border text-center transition-colors ${
                                        selectedCondition === value
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <button
                            onClick={handleApplyFilters}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersModal;
