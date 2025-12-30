/**
 * Geocoding Service
 * Provides geocoding functionality using OpenStreetMap Nominatim API
 * Returns latitude/longitude for addresses
 */

export interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
  success: boolean;
  error?: string;
}

export class GeocodingService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly USER_AGENT = 'TCC-Healthcare-App/1.0';
  private static readonly REQUEST_DELAY = 1000; // 1 second delay between requests (Nominatim rate limit)

  /**
   * Geocode an address to get coordinates
   * Tries multiple address variations for better success rate
   */
  static async geocodeAddress(
    address: string,
    city: string,
    state: string,
    zipCode: string,
    facilityName?: string
  ): Promise<GeocodeResult> {
    console.log('GEOCODING: Attempting to geocode address:', { address, city, state, zipCode, facilityName });

    // Build address variations to try (more comprehensive)
    const addressVariations: string[] = [];
    
    // 1. Full address with ZIP
    if (address && city && state && zipCode) {
      addressVariations.push(`${address}, ${city}, ${state} ${zipCode}`);
    }
    
    // 2. Full address without ZIP
    if (address && city && state) {
      addressVariations.push(`${address}, ${city}, ${state}`);
    }
    
    // 3. Facility name with full address (if provided)
    if (facilityName && address && city && state && zipCode) {
      addressVariations.push(`${facilityName}, ${address}, ${city}, ${state} ${zipCode}`);
    }
    
    // 4. Facility name with city/state (if provided)
    if (facilityName && city && state) {
      addressVariations.push(`${facilityName}, ${city}, ${state}`);
    }
    
    // 5. Just street address and city/state
    if (address && city && state) {
      addressVariations.push(`${address}, ${city}, ${state}`);
    }
    
    // 6. City and state only (fallback)
    if (city && state) {
      addressVariations.push(`${city}, ${state}`);
    }
    
    // Remove duplicates
    const uniqueVariations = [...new Set(addressVariations)];
    console.log('GEOCODING: Trying', uniqueVariations.length, 'address variations:', uniqueVariations);

    // Try each variation
    for (let i = 0; i < addressVariations.length; i++) {
      const variation = addressVariations[i];
      const result = await this.geocodeVariation(variation);

      if (result.success) {
        console.log('GEOCODING: Success with variation:', variation);
        return result;
      }

      // Rate limiting - wait between requests
      if (i < addressVariations.length - 1) {
        await this.delay(this.REQUEST_DELAY);
      }
    }

    console.warn('GEOCODING: All variations failed for address:', { address, city, state });
    return {
      latitude: null,
      longitude: null,
      success: false,
      error: 'Could not find coordinates for this address'
    };
  }

  /**
   * Geocode a single address variation
   */
  private static async geocodeVariation(address: string): Promise<GeocodeResult> {
    try {
      const url = new URL(this.NOMINATIM_BASE_URL);
      url.searchParams.set('q', address);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('countrycodes', 'us');

      console.log('GEOCODING: Requesting:', url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': this.USER_AGENT
        }
      });

      if (!response.ok) {
        console.error('GEOCODING: HTTP error:', response.status);
        return {
          latitude: null,
          longitude: null,
          success: false,
          error: `HTTP ${response.status}`
        };
      }

      const data = await response.json();
      console.log('GEOCODING: Response data:', data);

      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          success: true
        };
      }

      return {
        latitude: null,
        longitude: null,
        success: false,
        error: 'No results found'
      };
    } catch (error) {
      console.error('GEOCODING: Error:', error);
      return {
        latitude: null,
        longitude: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

