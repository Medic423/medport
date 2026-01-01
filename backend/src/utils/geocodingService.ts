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
  private static readonly USER_AGENT = 'TCC-EMS-System/1.0 (contact@traccems.com)';
  private static readonly REQUEST_DELAY = 1000; // 1 second delay between requests (Nominatim rate limit)
  private static readonly REQUEST_TIMEOUT = 10000; // 10 second timeout per request (increased from 5s)
  private static readonly MAX_VARIATIONS = 3; // Limit to 3 variations max for faster response
  private static readonly MAX_RETRIES = 2; // Retry failed requests up to 2 times

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
    
    // Clean and normalize address components
    const cleanAddress = address?.trim() || '';
    const cleanCity = city?.trim() || '';
    const cleanState = state?.trim() || '';
    const cleanZip = zipCode?.trim() || '';
    
    // 1. Full address with ZIP (standard format)
    if (cleanAddress && cleanCity && cleanState && cleanZip) {
      addressVariations.push(`${cleanAddress}, ${cleanCity}, ${cleanState} ${cleanZip}`);
    }
    
    // 2. Full address with ZIP (alternative format - comma before state)
    if (cleanAddress && cleanCity && cleanState && cleanZip) {
      addressVariations.push(`${cleanAddress}, ${cleanCity}, ${cleanState}, ${cleanZip}`);
    }
    
    // 3. Full address without ZIP
    if (cleanAddress && cleanCity && cleanState) {
      addressVariations.push(`${cleanAddress}, ${cleanCity}, ${cleanState}`);
    }
    
    // 4. Address with abbreviated street type (e.g., "Drive" -> "Dr")
    if (cleanAddress && cleanCity && cleanState && cleanZip) {
      const abbrevAddress = cleanAddress
        .replace(/\bDrive\b/gi, 'Dr')
        .replace(/\bStreet\b/gi, 'St')
        .replace(/\bAvenue\b/gi, 'Ave')
        .replace(/\bRoad\b/gi, 'Rd')
        .replace(/\bLane\b/gi, 'Ln')
        .replace(/\bCourt\b/gi, 'Ct')
        .replace(/\bBoulevard\b/gi, 'Blvd');
      if (abbrevAddress !== cleanAddress) {
        addressVariations.push(`${abbrevAddress}, ${cleanCity}, ${cleanState} ${cleanZip}`);
      }
    }
    
    // 5. Facility name with full address (if provided)
    if (facilityName && cleanAddress && cleanCity && cleanState && cleanZip) {
      addressVariations.push(`${facilityName}, ${cleanAddress}, ${cleanCity}, ${cleanState} ${cleanZip}`);
    }
    
    // 6. Facility name with city/state (if provided)
    if (facilityName && cleanCity && cleanState) {
      addressVariations.push(`${facilityName}, ${cleanCity}, ${cleanState}`);
    }
    
    // 7. Just street address and city/state
    if (cleanAddress && cleanCity && cleanState) {
      addressVariations.push(`${cleanAddress}, ${cleanCity}, ${cleanState}`);
    }
    
    // 8. City and state only (fallback)
    if (cleanCity && cleanState) {
      addressVariations.push(`${cleanCity}, ${cleanState}`);
    }
    
    // Remove duplicates and limit to MAX_VARIATIONS
    const uniqueVariations = [...new Set(addressVariations)].slice(0, this.MAX_VARIATIONS);
    console.log('GEOCODING: Trying', uniqueVariations.length, 'address variations:', uniqueVariations);

    // Try each variation with timeout
    for (let i = 0; i < uniqueVariations.length; i++) {
      const variation = uniqueVariations[i];
      
      // Use AbortController for proper timeout/cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.REQUEST_TIMEOUT);
      
      try {
        const result = await this.geocodeVariation(variation, controller.signal);
        clearTimeout(timeoutId);
        
        if (result.success) {
          console.log('GEOCODING: Success with variation:', variation);
          return result;
        }
        // If not successful, continue to next variation
        console.warn('GEOCODING: Variation failed:', variation, result.error);
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn('GEOCODING: Request timeout for variation:', variation);
          // Continue to next variation
        } else {
          // Other errors - log and continue
          console.error('GEOCODING: Error for variation:', variation, error);
        }
      }

      // Rate limiting - wait between requests (but skip if last one)
      if (i < uniqueVariations.length - 1) {
        console.log(`GEOCODING: Waiting ${this.REQUEST_DELAY}ms before next variation (rate limiting)`);
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
   * Geocode a single address variation with retry logic
   */
  private static async geocodeVariation(address: string, signal?: AbortSignal, retryCount: number = 0): Promise<GeocodeResult> {
    try {
      const url = new URL(this.NOMINATIM_BASE_URL);
      url.searchParams.set('q', address);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('countrycodes', 'us');

      console.log(`GEOCODING: Requesting (attempt ${retryCount + 1}):`, url.toString());

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.REQUEST_TIMEOUT);
      });

      // Create fetch promise
      const fetchPromise = fetch(url.toString(), {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: signal
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`GEOCODING: HTTP error ${response.status}:`, errorText);
        
        // Retry on 429 (Too Many Requests) or 503 (Service Unavailable)
        if ((response.status === 429 || response.status === 503) && retryCount < this.MAX_RETRIES) {
          console.log(`GEOCODING: Retrying after ${this.REQUEST_DELAY}ms due to ${response.status} status`);
          await this.delay(this.REQUEST_DELAY * (retryCount + 1)); // Exponential backoff
          return this.geocodeVariation(address, signal, retryCount + 1);
        }
        
        return {
          latitude: null,
          longitude: null,
          success: false,
          error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        };
      }

      const data = await response.json();
      console.log('GEOCODING: Response data length:', data?.length || 0);

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        if (isNaN(lat) || isNaN(lon)) {
          console.error('GEOCODING: Invalid coordinates in response:', result);
          return {
            latitude: null,
            longitude: null,
            success: false,
            error: 'Invalid coordinates in response'
          };
        }
        
        console.log('GEOCODING: Successfully geocoded:', { address, lat, lon });
        return {
          latitude: lat,
          longitude: lon,
          success: true
        };
      }

      console.warn('GEOCODING: No results found for address:', address);
      return {
        latitude: null,
        longitude: null,
        success: false,
        error: 'No results found'
      };
    } catch (error: any) {
      console.error('GEOCODING: Error:', error);
      
      // Retry on network errors or timeouts
      if (retryCount < this.MAX_RETRIES && 
          (error.name === 'AbortError' || 
           error.message?.includes('timeout') || 
           error.message?.includes('ECONNRESET') ||
           error.message?.includes('ENOTFOUND'))) {
        console.log(`GEOCODING: Retrying after ${this.REQUEST_DELAY}ms due to network error`);
        await this.delay(this.REQUEST_DELAY * (retryCount + 1)); // Exponential backoff
        return this.geocodeVariation(address, signal, retryCount + 1);
      }
      
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

