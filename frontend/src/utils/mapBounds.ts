/**
 * Map bounds utility functions for trip filtering and visualization
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Check if a coordinate point falls within map bounds
 */
export const isPointInBounds = (point: LatLng | null, bounds: MapBounds | null): boolean => {
  if (!point || !bounds) return false;
  
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
};

/**
 * Check if a trip's pickup or destination is within bounds
 */
export const isTripInBounds = (
  pickupCoords: LatLng | null,
  destinationCoords: LatLng | null,
  bounds: MapBounds | null
): boolean => {
  if (!bounds) return true;
  
  return isPointInBounds(pickupCoords, bounds) || isPointInBounds(destinationCoords, bounds);
};

/**
 * Calculate bounding box from array of coordinates
 */
export const calculateBoundingBox = (coordinates: LatLng[]): MapBounds | null => {
  if (coordinates.length === 0) return null;

  let north = coordinates[0].lat;
  let south = coordinates[0].lat;
  let east = coordinates[0].lng;
  let west = coordinates[0].lng;

  for (const coord of coordinates) {
    north = Math.max(north, coord.lat);
    south = Math.min(south, coord.lat);
    east = Math.max(east, coord.lng);
    west = Math.min(west, coord.lng);
  }

  // Add padding to bounds
  const latPadding = (north - south) * 0.1;
  const lngPadding = (east - west) * 0.1;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding,
  };
};

/**
 * Calculate center point from bounding box
 */
export const calculateBoundsCenter = (bounds: MapBounds): LatLng => {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
};

/**
 * Calculate appropriate zoom level based on bounds
 */
export const calculateZoomLevel = (bounds: MapBounds): number => {
  const latDelta = bounds.north - bounds.south;
  const lngDelta = bounds.east - bounds.west;
  const maxDelta = Math.max(latDelta, lngDelta);

  // Approximate zoom level calculation
  if (maxDelta > 20) return 4;
  if (maxDelta > 10) return 5;
  if (maxDelta > 5) return 6;
  if (maxDelta > 2) return 7;
  if (maxDelta > 1) return 8;
  if (maxDelta > 0.5) return 9;
  if (maxDelta > 0.25) return 10;
  if (maxDelta > 0.1) return 11;
  if (maxDelta > 0.05) return 12;
  return 13;
};
