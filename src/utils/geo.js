/**
 * geo.js — Convert (lat, lng, radiusKm) to a bounding box
 * for a simple lat/lng index query.
 *
 * Uses the Haversine-based approximation:
 *   Δlat  ≈ radius / 111.32
 *   Δlng  ≈ radius / (111.32 × cos(lat))
 */

/**
 * @param {number} lat   Centre latitude  (-90 … 90)
 * @param {number} lng   Centre longitude (-180 … 180)
 * @param {number} km    Radius in kilometres
 * @returns {{ minLat: number, maxLat: number, minLng: number, maxLng: number }}
 */
export const boundingBox = (lat, lng, km) => {
    const KM_PER_DEG_LAT = 111.32;
    const deltaLat = km / KM_PER_DEG_LAT;
    const deltaLng = km / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));

    return {
        minLat: lat - deltaLat,
        maxLat: lat + deltaLat,
        minLng: lng - deltaLng,
        maxLng: lng + deltaLng
    };
};

/**
 * Haversine distance between two points (in km).
 * Used to re-rank results after the bounding-box filter.
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

