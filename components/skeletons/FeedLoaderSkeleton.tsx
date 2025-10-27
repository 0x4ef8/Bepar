import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

const FeedLoaderSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
    );
};

export default FeedLoaderSkeleton;