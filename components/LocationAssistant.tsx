import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocation } from '../hooks/useLocation';
import type { Listing } from '../types';
import { SparklesIcon, GlobeAltIcon } from './Icons';

interface GroundingChunk {
    maps: {
        uri: string;
        title: string;
    }
}

const LocationAssistant: React.FC<{ listing: Listing }> = ({ listing }) => {
    const { userLocation } = useLocation();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    
    const examplePrompts = [
        "What are some good restaurants near this location?",
        "Is there a bus stop nearby?",
        "How far is this from the city center?",
    ];

    const handleAskAI = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const fullPrompt = `The item is located near latitude ${listing.location.lat} and longitude ${listing.location.lng}. Based on this, please answer: "${prompt}"`;
            
            const generateContentRequest = {
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    tools: [{ googleMaps: {} }],
                    ...(userLocation && {
                        toolConfig: {
                            retrievalConfig: {
                                latLng: {
                                    latitude: userLocation.lat,
                                    longitude: userLocation.lng
                                }
                            }
                        }
                    })
                },
            };

            const result = await ai.models.generateContent(generateContentRequest);

            setResponse(result.text);
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                setSources(groundingChunks.filter((chunk: any) => chunk.maps));
            }

        } catch (err) {
            console.error("Gemini API Error:", err);
            setError("Sorry, something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExampleClick = (example: string) => {
        setPrompt(example);
    }

    return (
        <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-8 h-8 text-primary" />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">AI Location Assistant</h3>
                    <p className="text-sm text-gray-600">Get location-based insights for this listing.</p>
                </div>
            </div>
            
            <div className="space-y-4">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Are there any parks within walking distance?"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    disabled={isLoading}
                />
                <div className="text-xs text-gray-500">
                    Try asking:
                    {examplePrompts.map((p, i) => (
                        <button key={i} onClick={() => handleExampleClick(p)} className="ml-2 text-primary/80 hover:underline">
                           "{p}"
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleAskAI}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Thinking...' : 'Ask AI'}
                </button>
            </div>

            {isLoading && (
                <div className="mt-4 text-center">
                    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Fetching up-to-date info...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
            )}
            
            {response && (
                 <div className="mt-6 border-t pt-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
                    {sources.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Sources from Google Maps:</h4>
                             <div className="space-y-2">
                                {sources.map((source, index) => (
                                    <a
                                        key={index}
                                        href={source.maps.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-white border rounded-md hover:bg-gray-50 text-sm text-blue-600 hover:underline"
                                    >
                                        <GlobeAltIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                        <span>{source.maps.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default LocationAssistant;
