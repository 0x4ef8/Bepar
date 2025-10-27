import React, { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;

// Module-level state to prevent reloading the script
let isScriptLoaded = false;
let loadingPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
    if (isScriptLoaded) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        if (document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`)) {
            isScriptLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_MAPS_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            isScriptLoaded = true;
            loadingPromise = null;
            resolve();
        };
        
        script.onerror = (error) => {
            loadingPromise = null;
            reject(error);
        };
        
        document.head.appendChild(script);
    });

    return loadingPromise;
};

export const useGoogleMaps = () => {
    const [isLoaded, setIsLoaded] = useState(isScriptLoaded);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
        if (isLoaded) return;
        
        let isMounted = true;
        
        loadScript()
            .then(() => {
                if (isMounted) {
                    setIsLoaded(true);
                }
            })
            .catch((error) => {
                console.error("Failed to load Google Maps script", error);
                if (isMounted) {
                    setLoadError(error as Error);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isLoaded]);

    return { isLoaded, loadError };
};
