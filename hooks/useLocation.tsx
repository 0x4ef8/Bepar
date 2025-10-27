import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Location } from '../types';

type GeolocationPermissionStatus = 'prompt' | 'granted' | 'denied';

interface LocationContextType {
    userLocation: Location | null;
    permissionStatus: GeolocationPermissionStatus;
    isLocating: boolean;
    requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<GeolocationPermissionStatus>('prompt');
    const [isLocating, setIsLocating] = useState(false);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setPermissionStatus('denied');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setPermissionStatus('granted');
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setPermissionStatus('denied');
                setIsLocating(false);
            }
        );
    }, []);

    return (
        <LocationContext.Provider value={{ userLocation, permissionStatus, isLocating, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
