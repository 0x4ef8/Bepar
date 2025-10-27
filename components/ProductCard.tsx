import React from 'react';
import type { Listing, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { MapPinIcon, CheckBadgeIcon, HeartIcon, PencilSquareIcon } from './Icons';
import { timeSince } from '../utils/timeSince';


interface ProductCardProps {
    listing: Listing;
    seller?: User;
    onClick: () => void;
    onEdit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ listing, seller, onClick, onEdit }) => {
    const { isSaved, toggleSaveItem } = useAuth();
    const saved = isSaved(listing._id);

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        toggleSaveItem(listing._id);
    };
    
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    return (
        <div onClick={onClick} className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 group">
            <div className="relative">
                <img className="w-full h-48 object-cover" src={listing.images[0] || 'https://picsum.photos/seed/placeholder/600/400'} alt={listing.title} />
                 <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        रू{listing.price.toLocaleString('en-NP')}
                    </div>
                     <div className={`text-white text-xs font-semibold px-2 py-1 rounded-full ${listing.priceType === 'negotiable' ? 'bg-accent' : 'bg-secondary/90'}`}>
                        {listing.priceType === 'negotiable' ? 'Negotiable' : 'Fixed'}
                    </div>
                </div>
                 <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button onClick={handleSaveClick} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-white transition-all duration-300">
                        <HeartIcon className={`w-6 h-6 transition-colors ${saved ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                    </button>
                    {onEdit && (
                         <button onClick={handleEditClick} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-primary hover:bg-white transition-all duration-300" title="Edit Listing">
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="p-4">
                 <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{listing.category}</span>
                    <span>{timeSince(listing.createdAt)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-primary transition-colors mt-1">{listing.title}</h3>
                
                {seller && (
                    <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                        <img className="w-8 h-8 rounded-full object-cover" src={seller.photo} alt={`${seller.firstName} ${seller.lastName}`} />
                        <div className="ml-2">
                            <p className="text-sm font-medium text-gray-700 flex items-center">
                                {seller.firstName} {seller.lastName}
                                {seller.isVerified && <CheckBadgeIcon className="w-4 h-4 text-secondary ml-1" />}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                                <MapPinIcon className="w-3 h-3 mr-1"/>
                                {listing.distance ? `${listing.distance.toFixed(1)} km away` : 'Approx. location'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;