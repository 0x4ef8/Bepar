// FIX: Declare google as any to work around missing @types/google.maps which causes compilation errors.
declare const google: any;
import type { Location } from '../types';

export interface Bounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

/**
 * Calculates the bounding box for a set of locations.
 * @param locations - An array of location objects with lat and lng.
 * @returns An object containing the min/max latitude and longitude.
 */
export const calculateBounds = (locations: Location[]): Bounds | null => {
    if (locations.length === 0) {
        // Return null if no locations, map can decide default view
        return null;
    }

    const latitudes = locations.map(loc => loc.lat);
    const longitudes = locations.map(loc => loc.lng);

    return {
        minLat: Math.min(...latitudes),
        maxLat: Math.max(...latitudes),
        minLng: Math.min(...longitudes),
        maxLng: Math.max(...longitudes),
    };
};

/**
 * Converts a simple Bounds object to a google.maps.LatLngBounds object.
 * @param bounds - The simple bounds object.
 * @returns A google.maps.LatLngBounds object.
 */
// FIX: Return type is `any` because google.maps types are not available.
export const boundsToGoogleBounds = (bounds: Bounds): any => {
    // FIX: Use `google` instead of `window.google` and rely on the global declaration.
    return new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.minLat, bounds.minLng),
        new google.maps.LatLng(bounds.maxLat, bounds.maxLng)
    );
};