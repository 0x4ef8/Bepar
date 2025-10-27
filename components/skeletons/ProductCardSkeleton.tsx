import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <div className="ml-2 flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
