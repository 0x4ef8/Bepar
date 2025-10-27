
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { SparklesIcon, CloudArrowUpIcon, ArrowDownTrayIcon, ArrowPathIcon } from '../Icons';
import { blobToBase64 } from '../../utils/fileUtils';

const loadingMessages = [
    'Warming up the AI artists...',
    'Mixing digital paints...',
    'Generating creative sparks...',
    'Almost there, creating a masterpiece!',
];

const AIStudioPage: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ url: string; blob: Blob } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
            }, 2500);
        }
        return () => window.clearInterval(interval);
    }, [isLoading]);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setOriginalImage({ url, blob: file });
            setEditedImage(null);
            setError(null);
        } else {
            setError('Please upload a valid image file (PNG, JPG, etc.).');
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    
    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt.trim()) {
            setError("Please upload an image and provide an editing prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        setCurrentMessageIndex(0);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await blobToBase64(originalImage.blob);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: originalImage.blob.type } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    setEditedImage(imageUrl);
                    foundImage = true;
                    break;
                }
            }
            if (!foundImage) {
                 setError("The AI couldn't generate an image from that prompt. Please try a different one.");
            }

        } catch (err) {
            console.error("Gemini API Error:", err);
            setError("Sorry, an error occurred while generating the image. Please check the console and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!editedImage) return;
        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `edited-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleStartOver = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setPrompt('');
        setError(null);
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const ImagePanel: React.FC<{ title: string; imageUrl?: string | null; isLoading?: boolean }> = ({ title, imageUrl, isLoading }) => (
        <div className="bg-gray-200 rounded-lg aspect-square flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
             <h3 className="absolute top-2 left-3 text-sm font-bold text-gray-700 bg-white/70 px-3 py-1 rounded-full">{title}</h3>
            {isLoading && (
                 <div className="flex flex-col items-center text-center p-4">
                     <SparklesIcon className="w-12 h-12 text-primary animate-pulse" />
                     <p className="mt-4 font-semibold text-gray-700">{loadingMessages[currentMessageIndex]}</p>
                 </div>
            )}
            {!isLoading && imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-contain" />}
            {!isLoading && !imageUrl && <SparklesIcon className="w-24 h-24 text-gray-400" />}
        </div>
    );

    if (!originalImage) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center h-full">
                 <div 
                    onDragEnter={onDragEnter}
                    onDragOver={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`w-full max-w-2xl p-8 border-2 ${isDragging ? 'border-primary' : 'border-gray-300'} border-dashed rounded-lg transition-colors`}
                 >
                    <SparklesIcon className="w-16 h-16 mx-auto text-primary" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-800">AI Image Studio</h1>
                    <p className="mt-2 text-gray-600">Bring your ideas to life. Upload an image and describe your edits.</p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-6 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <CloudArrowUpIcon className="w-6 h-6" />
                        Upload Image
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                     {error && <p className="mt-4 text-red-500">{error}</p>}
                    <div className="mt-8 text-left text-sm text-gray-500">
                        <h4 className="font-semibold text-gray-700 mb-2">Example Prompts:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>"Add a retro, vintage filter"</li>
                            <li>"Change the background to a sunny beach"</li>
                            <li>"Make this photo look like an oil painting"</li>
                            <li>"Remove the person in the background"</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImagePanel title="Original" imageUrl={originalImage.url} />
                <ImagePanel title="Edited" imageUrl={editedImage} isLoading={isLoading} />
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
                 {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your edit, e.g., 'add a cat wearing a hat'"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm font-medium text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Generate
                    </button>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
                     <button
                        onClick={handleStartOver}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Start Over
                    </button>
                     <button
                        onClick={handleDownload}
                        disabled={!editedImage || isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIStudioPage;
