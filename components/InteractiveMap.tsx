import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Listing } from '../types';
import { useLocation } from '../hooks/useLocation';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { calculateBounds, boundsToGoogleBounds } from '../utils/mapUtils';

// FIX: Declare google as any to work around missing @types/google.maps which causes compilation errors.
declare const google: any;

const InfoWindowContent = (listing: Listing) => `
    <div class="w-48 cursor-pointer font-sans" id="info-window-content">
        <img src="${listing.images[0]}" alt="${listing.title}" class="w-full h-24 object-cover rounded-t-md"/>
        <div class="p-2">
            <p class="font-bold text-sm truncate text-gray-800">${listing.title}</p>
            <p class="text-primary font-semibold">रू${listing.price.toLocaleString('en-NP')}</p>
        </div>
    </div>
`;

const InteractiveMap: React.FC<{ listings: Listing[], onSelectListing: (listing: Listing) => void }> = ({ listings, onSelectListing }) => {
    const { isLoaded, loadError } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    const { userLocation } = useLocation();

    // FIX: Use `any` for map and marker types as google maps types are not available.
    const [map, setMap] = useState<any | null>(null);
    const markersRef = useRef<any[]>([]);
    
    const bounds = useMemo(() => calculateBounds(listings.map(l => l.location)), [listings]);

    // Initialize map
    useEffect(() => {
        if (isLoaded && mapRef.current && !map) {
            // FIX: Use `google` instead of `window.google` and rely on the global declaration.
            const mapInstance = new google.maps.Map(mapRef.current, {
                center: { lat: 27.7, lng: 85.3 },
                zoom: 12,
                disableDefaultUI: true,
                zoomControl: true,
                mapId: 'SUPERAPP_MAP_ID' // Optional: for custom styling
            });
            setMap(mapInstance);
        }
    }, [isLoaded, map]);
    
    // Fit map bounds to listings
    useEffect(() => {
        if (map && bounds) {
            const googleBounds = boundsToGoogleBounds(bounds);
            map.fitBounds(googleBounds, 60); // 60px padding
        }
    }, [map, bounds]);

    // Manage user location marker
    useEffect(() => {
        if (map && userLocation) {
            // FIX: Use `google` instead of `window.google`.
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                    // FIX: `google` namespace is now available.
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#1D4ED8",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                },
            });
        }
    }, [map, userLocation]);

    // Manage listing markers
    useEffect(() => {
        if (map && isLoaded) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
            
            // FIX: Use `google` instead of `window.google`.
            const infoWindow = new google.maps.InfoWindow({
                content: '',
                disableAutoPan: true,
            });

            // Add new markers
            const newMarkers = listings.map(listing => {
                // FIX: Use `google` instead of `window.google`.
                const marker = new google.maps.Marker({
                    position: listing.location,
                    map: map,
                    title: listing.title,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 40px; height: 40px; color: #1D4ED8;">
                                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.16-4.242 12.082 12.082 0 003.06-7.397A12.083 12.083 0 0012 1.5a12.083 12.083 0 00-10.002 10.002c0 2.748 1.057 5.281 3.06 7.397a16.975 16.975 0 005.16 4.242zM12 10.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" clip-rule="evenodd" />
                            </svg>`
                        ),
                        // FIX: Use `google` instead of `window.google`.
                        anchor: new google.maps.Point(20, 40),
                        scaledSize: new google.maps.Size(40, 40),
                    }
                });

                marker.addListener('mouseover', () => {
                    infoWindow.setContent(InfoWindowContent(listing));
                    infoWindow.open(map, marker);
                });

                marker.addListener('click', () => {
                     onSelectListing(listing);
                });

                return marker;
            });
            markersRef.current = newMarkers;

            // Handle clicking on the info window
            infoWindow.addListener('domready', () => {
                const content = document.getElementById('info-window-content');
                if (content) {
                    content.addEventListener('click', () => {
                        const currentListing = listings.find(l => l.title === (infoWindow as any).marker.getTitle());
                        if (currentListing) {
                            onSelectListing(currentListing);
                        }
                    });
                }
            });
        }

        return () => {
            // Clean up markers on component unmount
             markersRef.current.forEach(marker => marker.setMap(null));
        }

    }, [map, listings, isLoaded, onSelectListing]);

    if (loadError) {
        return <div className="text-center text-red-500 p-8 h-[600px] flex items-center justify-center bg-red-50 rounded-lg">Failed to load Google Maps. Please check your API key and internet connection.</div>;
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                <p className="text-gray-500">Loading Map...</p>
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border">
             <div ref={mapRef} className="w-full h-full" />
             <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-xs text-gray-600 shadow">
                Map data &copy;2024 Google
            </div>
        </div>
    );
};

export default InteractiveMap;