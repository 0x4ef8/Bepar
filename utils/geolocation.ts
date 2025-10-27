import type { Location } from '../types';

/**
 * Calculates the distance between two points on the Earth's surface using the Haversine formula.
 * @param coords1 - The first location with latitude and longitude.
 * @param coords2 - The second location with latitude and longitude.
 * @returns The distance in kilometers.
 */
export const haversineDistance = (coords1: Location, coords2: Location): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLng = (coords2.lng - coords1.lng) * (Math.PI / 180);
    const lat1 = coords1.lat * (Math.PI / 180);
    const lat2 = coords2.lat * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};
