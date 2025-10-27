import React, { useState } from 'react';
import { useListings } from '../../hooks/useListings';
import { XMarkIcon, TrashIcon } from '../Icons';
import type { Listing, ListingCondition } from '../../types';
import ImageUploader from '../ImageUploader';

interface EditListingModalProps {
    listing: Listing;
    onClose: () => void;
}

const EditListingModal: React.FC<EditListingModalProps> = ({ listing, onClose }) => {
    const { updateListing, deleteListing } = useListings();
    
    const [title, setTitle] = useState(listing.title);
    const [description, setDescription] = useState(listing.description);
    const [price, setPrice] = useState(String(listing.price));
    const [priceType, setPriceType] = useState<'fixed' | 'negotiable'>(listing.priceType);
    const [category, setCategory] = useState<Listing['category']>(listing.category);
    const [condition, setCondition] = useState<ListingCondition>(listing.condition || 'used');
    const [images, setImages] = useState<string[]>(listing.images);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price || !category) {
            alert('Please fill in all required fields.');
            return;
        }
        setIsSaving(true);
        try {
            await updateListing(listing._id, {
                title,
                description,
                price: Number(price),
                priceType,
                category,
                condition,
                images,
            });
            onClose();
        } catch (error) {
            console.error("Failed to update listing", error);
            alert("There was an error updating your listing.");
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            setIsDeleting(true);
            try {
                await deleteListing(listing._id);
                onClose();
            } catch (error) {
                console.error("Failed to delete listing", error);
                alert("There was an error deleting your listing.");
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
               <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Listing</h2>
                        <p className="mt-2 text-gray-600">Update the details for your item.</p>
                    </div>

                    <form className="mt-8 space-y-4 max-h-[70vh] overflow-y-auto pr-2" onSubmit={handleSubmit}>
                        <ImageUploader onImagesChange={setImages} initialImages={images} />
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (NPR)</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">रू</span>
                                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category" value={category} onChange={e => setCategory(e.target.value as Listing['category'])} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                    <option>Electronics</option>
                                    <option>Furniture</option>
                                    <option>Vehicles</option>
                                    <option>Clothing</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price Type</label>
                                <div className="mt-1 flex gap-2 rounded-md border border-gray-300 p-1.5">
                                    <label className={`flex-1 text-center py-1.5 rounded-md cursor-pointer text-sm transition-colors ${priceType === 'negotiable' ? 'bg-primary text-white shadow' : 'hover:bg-gray-100'}`}>
                                        <input type="radio" name="priceType" value="negotiable" checked={priceType === 'negotiable'} onChange={() => setPriceType('negotiable')} className="sr-only" />
                                        Negotiable
                                    </label>
                                    <label className={`flex-1 text-center py-1.5 rounded-md cursor-pointer text-sm transition-colors ${priceType === 'fixed' ? 'bg-primary text-white shadow' : 'hover:bg-gray-100'}`}>
                                        <input type="radio" name="priceType" value="fixed" checked={priceType === 'fixed'} onChange={() => setPriceType('fixed')} className="sr-only" />
                                        Fixed Price
                                    </label>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
                                <select id="condition" value={condition} onChange={e => setCondition(e.target.value as ListingCondition)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                    <option value="new">New</option>
                                    <option value="like-new">Like New</option>
                                    <option value="used">Used</option>
                                    <option value="for-parts">For Parts / Not Working</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                            <button
                                type="submit"
                                disabled={isSaving || isDeleting}
                                className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                             <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSaving || isDeleting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                            >
                                <TrashIcon className="w-5 h-5"/>
                                {isDeleting ? 'Deleting...' : 'Delete Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditListingModal;
