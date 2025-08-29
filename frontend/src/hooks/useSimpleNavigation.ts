import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

export interface SimpleNavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  category: string;
}

export interface SimpleNavigation {
  userType: 'hospital' | 'ems' | 'center';
  navigation: SimpleNavigationItem[];
}

export const useSimpleNavigation = () => {
  const [navigation, setNavigation] = useState<SimpleNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'hospital' | 'ems' | 'center' | null>(null);

  // Get navigation for current user
  const fetchNavigation = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[SIMPLE_NAVIGATION] Fetching navigation from simplified endpoint');
      
      const response = await apiRequest('/simple-navigation/navigation', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch navigation: ${response.statusText}`);
      }

      // Check if response has content
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        console.error('[SIMPLE_NAVIGATION] Empty response received from navigation endpoint');
        throw new Error('Empty response from server - please check server logs');
      }

      // Try to parse the response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[SIMPLE_NAVIGATION] JSON parse error:', parseError, 'Response text:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      if (result.success) {
        console.log('[SIMPLE_NAVIGATION] Navigation fetched successfully:', result.data);
        setNavigation(result.data);
        setUserType(result.data.userType);
      } else {
        throw new Error(result.message || 'Failed to fetch navigation');
      }
    } catch (err) {
      console.error('[SIMPLE_NAVIGATION] Navigation fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's landing page
  const fetchLandingPage = useCallback(async (token: string) => {
    try {
      const response = await apiRequest('/simple-navigation/landing-page', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch landing page: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.data.landingPage;
      } else {
        throw new Error(result.message || 'Failed to fetch landing page');
      }
    } catch (err) {
      console.error('[SIMPLE_NAVIGATION] Landing page fetch error:', err);
      throw err;
    }
  }, []);

  // Get user type information
  const fetchUserType = useCallback(async (token: string) => {
    try {
      const response = await apiRequest('/simple-navigation/user-type', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user type: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setUserType(result.data.userType);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch user type');
      }
    } catch (err) {
      console.error('[SIMPLE_NAVIGATION] User type fetch error:', err);
      throw err;
    }
  }, []);

  // Clear navigation data
  const clearNavigation = useCallback(() => {
    setNavigation(null);
    setUserType(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    navigation,
    userType,
    loading,
    error,
    fetchNavigation,
    fetchLandingPage,
    fetchUserType,
    clearNavigation
  };
};
