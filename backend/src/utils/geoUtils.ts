/**
 * Geographic utility functions for MedPort real-time tracking
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate the bearing from one point to another
 * @param lat1 Latitude of starting point in degrees
 * @param lon1 Longitude of starting point in degrees
 * @param lat2 Latitude of ending point in degrees
 * @param lon2 Longitude of ending point in degrees
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalize to 0-360
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the midpoint between two coordinates
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Object with latitude and longitude of midpoint
 */
export function calculateMidpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { latitude: number; longitude: number } {
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);
  
  const Bx = Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad);
  const By = Math.cos(lat2Rad) * Math.sin(lon2Rad - lon1Rad);
  
  const midLat = Math.atan2(
    Math.sin(lat1Rad) + Math.sin(lat2Rad),
    Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By)
  );
  
  const midLon = lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);
  
  return {
    latitude: toDegrees(midLat),
    longitude: toDegrees(midLon),
  };
}

/**
 * Check if a point is within a circular area
 * @param centerLat Latitude of center point in degrees
 * @param centerLon Longitude of center point in degrees
 * @param radius Radius in kilometers
 * @param pointLat Latitude of point to check in degrees
 * @param pointLon Longitude of point to check in degrees
 * @returns True if point is within the circle
 */
export function isPointInCircle(
  centerLat: number,
  centerLon: number,
  radius: number,
  pointLat: number,
  pointLon: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radius;
}

/**
 * Calculate the area of a polygon defined by coordinates
 * @param coordinates Array of coordinate objects with latitude and longitude
 * @returns Area in square kilometers
 */
export function calculatePolygonArea(coordinates: Array<{ latitude: number; longitude: number }>): number {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const R = 6371; // Earth's radius in kilometers
  
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    const lat1 = toRadians(coordinates[i].latitude);
    const lon1 = toRadians(coordinates[i].longitude);
    const lat2 = toRadians(coordinates[j].latitude);
    const lon2 = toRadians(coordinates[j].longitude);
    
    area += (lon2 - lon1) * (2 + Math.tan(lat1) + Math.tan(lat2));
  }
  
  area = Math.abs(area * R * R / 2);
  return area;
}

/**
 * Calculate the speed in mph from distance and time
 * @param distance Distance in kilometers
 * @param timeMinutes Time in minutes
 * @returns Speed in miles per hour
 */
export function calculateSpeed(distance: number, timeMinutes: number): number {
  if (timeMinutes <= 0) return 0;
  const distanceMiles = distance * 0.621371; // Convert km to miles
  const timeHours = timeMinutes / 60;
  return distanceMiles / timeHours;
}

/**
 * Calculate travel time based on distance and speed
 * @param distance Distance in kilometers
 * @param speed Speed in miles per hour
 * @returns Travel time in minutes
 */
export function calculateTravelTime(distance: number, speed: number): number {
  if (speed <= 0) return 0;
  const distanceMiles = distance * 0.621371; // Convert km to miles
  const timeHours = distanceMiles / speed;
  return timeHours * 60; // Convert to minutes
}

/**
 * Format coordinates for display
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @returns Formatted coordinate string
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  const latAbs = Math.abs(latitude);
  const lonAbs = Math.abs(longitude);
  
  const latDeg = Math.floor(latAbs);
  const latMin = Math.floor((latAbs - latDeg) * 60);
  const latSec = Math.round(((latAbs - latDeg - latMin / 60) * 3600) * 100) / 100;
  
  const lonDeg = Math.floor(lonAbs);
  const lonMin = Math.floor((lonAbs - lonDeg) * 60);
  const lonSec = Math.round(((lonAbs - lonDeg - lonMin / 60) * 3600) * 100) / 100;
  
  return `${latDeg}°${latMin}'${latSec}"${latDir}, ${lonDeg}°${lonMin}'${lonSec}"${lonDir}`;
}

/**
 * Parse coordinate string to latitude and longitude
 * @param coordinateString String in format "lat,lon" or "lat, lon"
 * @returns Object with latitude and longitude, or null if invalid
 */
export function parseCoordinates(coordinateString: string): { latitude: number; longitude: number } | null {
  try {
    const parts = coordinateString.split(',').map(part => part.trim());
    if (parts.length !== 2) return null;
    
    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);
    
    if (isNaN(latitude) || isNaN(longitude)) return null;
    if (latitude < -90 || latitude > 90) return null;
    if (longitude < -180 || longitude > 180) return null;
    
    return { latitude, longitude };
  } catch (error) {
    return null;
  }
}
