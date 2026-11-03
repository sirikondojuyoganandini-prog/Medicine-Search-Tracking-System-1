/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {number} lat1 Latitude of first point
 * @param {number} lon1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lon2 Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 2 decimal places
}

/**
 * Calculate distance in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const km = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return km !== null ? Math.round(km * 1000) : null;
}

/**
 * Check if coordinate is inside geofence radius
 */
export function isInsideGeofence(userLat, userLng, shopLat, shopLng, radiusMeters) {
  const distanceMeters = calculateDistanceMeters(userLat, userLng, shopLat, shopLng);
  if (distanceMeters === null) return false;
  return distanceMeters <= radiusMeters;
}

/**
 * Format distance nicely
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return 'Unknown';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
