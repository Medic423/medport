import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

export interface FreemiumSettings {
  userId: string;
  userType: 'center' | 'hospital' | 'ems';
  features: {
    revenueOptimization: boolean;
    advancedAnalytics: boolean;
    customReporting: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
    multiAgencyCoordination: boolean;
  };
  planType: 'free' | 'premium' | 'enterprise';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureInfo {
  id: keyof FreemiumSettings['features'];
  name: string;
  description: string;
}

export const useFreemium = () => {
  const [settings, setSettings] = useState<FreemiumSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's freemium settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiRequest('/freemium/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch freemium settings: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch freemium settings');
      }
    } catch (err) {
      console.error('[FREEMIUM] Settings fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has access to a specific feature
  const hasFeatureAccess = useCallback(async (feature: keyof FreemiumSettings['features']): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await apiRequest(`/freemium/feature/${feature}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.data.hasAccess;
    } catch (err) {
      console.error('[FREEMIUM] Feature access check error:', err);
      return false;
    }
  }, []);

  // Get all available features
  const getAvailableFeatures = useCallback(async (): Promise<FeatureInfo[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await apiRequest('/freemium/features', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error('[FREEMIUM] Features fetch error:', err);
      return [];
    }
  }, []);

  // Update settings (admin only)
  const updateSettings = useCallback(async (updates: Partial<FreemiumSettings>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await apiRequest('/freemium/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[FREEMIUM] Update settings error:', err);
      return false;
    }
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    hasFeatureAccess,
    getAvailableFeatures,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
