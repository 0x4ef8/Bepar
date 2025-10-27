import React, { useState, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from './Icons';
import { api } from '../api';

type ImageState = {
    file: File;
    url: string;
    isLoading: boolean;
    error?: string;
};

interface ImageUploaderProps {
  initialImages?: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialImages = [], onImagesChange }) => {
  const [imageStates, setImageStates] = useState<ImageState[]>(
      initialImages.map(url => ({ file: new File([], ""), url, isLoading: false }))
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList) => {
    const newFiles = Array.from(files);
    
    newFiles.forEach(file => {
        const tempUrl = URL.createObjectURL(file);
        const newImageState: ImageState = { file, url: tempUrl, isLoading: true };

        setImageStates(prev => [...prev, newImageState]);

        api.uploadImage(file)
            .then(response => {
                setImageStates(prev => {
                    const updated = prev.map(s => s.url === tempUrl ? { ...s, url: response.url, isLoading: false } : s);
                    onImagesChange(updated.filter(s => !s.isLoading).map(s => s.url));
                    return updated;
                });
                URL.revokeObjectURL(tempUrl); // Clean up temp object URL
            })
            .catch(err => {
                 setImageStates(prev => prev.map(s => s.url === tempUrl ? { ...s, isLoading: false, error: 'Upload failed' } : s));
            });
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeImage = (urlToRemove: string) => {
    const updatedImages = imageStates.filter(s => s.url !== urlToRemove);
    setImageStates(updatedImages);
    onImagesChange(updatedImages.filter(s => !s.isLoading).map(s => s.url));
  };

  return (
    <div>
      <label 
        htmlFor="image-upload" 
        className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 ${isDragging ? 'border-primary' : 'border-gray-300'} border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className="flex items-center space-x-2">
          <CloudArrowUpIcon className="w-8 h-8 text-gray-600" />
          <span className="font-medium text-gray-600">
            Drop files to attach, or <span className="text-primary underline">browse</span>
          </span>
        </span>
        <input 
          type="file" 
          id="image-upload" 
          name="image-upload" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => e.target.files && handleFileChange(e.target.files)}
        />
      </label>

      {imageStates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {imageStates.map((state, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={state.url} alt={`upload-preview-${index}`} className="w-full h-full object-cover rounded-md" />
              {state.isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div>
                  </div>
              )}
               {state.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center rounded-md text-white text-xs text-center p-1">
                      {state.error}
                  </div>
              )}
              {!state.isLoading && (
                <button
                    type="button"
                    onClick={() => removeImage(state.url)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;