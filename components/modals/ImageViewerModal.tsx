import React from 'react';
import { XMarkIcon } from '../Icons';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <XMarkIcon className="w-8 h-8"/>
      </button>
      <div className="relative max-w-4xl max-h-[90vh]">
        <img 
            src={imageUrl} 
            alt="Full screen view" 
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
        />
      </div>
    </div>
  );
};

export default ImageViewerModal;
