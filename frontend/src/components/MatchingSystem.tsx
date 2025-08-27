import React, { useState, useEffect } from 'react';

interface MatchingCriteria {
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  originFacilityId: string;
  destinationFacilityId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  specialRequirements?: string;
  estimatedDistance?: number;
  timeWindow?: {
    earliest: string;
    latest: string;
  };
}

interface MatchingResult {
  agency: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  unitAvailability: {
    id: string;
    status: string;
  };
  matchingScore: number;
  reasons: string[];
  estimatedArrival: string;
  revenuePotential: number;
  isLDT: boolean;
}

interface MatchingPreferences {
  agencyId: string;
  preferredServiceAreas: string[];
  preferredTransportLevels: ('BLS' | 'ALS' | 'CCT')[];
  maxDistance: number;
  preferredTimeWindows: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  revenueThreshold: number;
}

interface MatchHistory {
  bidId: string;
  transportRequest: any;
  status: string;
  submittedAt: string;
  acceptedAt?: string;
  revenue: number;
}

interface MatchAnalytics {
  totalBids: number;
  acceptedBids: number;
  totalRevenue: number;
  acceptanceRate: number;
  averageRevenue: number;
}

const MatchingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find-matches' | 'preferences' | 'history'>('find-matches');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Find Matches State
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    transportLevel: 'BLS',
    originFacilityId: '',
    destinationFacilityId: '',
    priority: 'MEDIUM',
    specialRequirements: '',
    estimatedDistance: undefined,
    timeWindow: {
      earliest: new Date().toISOString().slice(0, 16),
      latest: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  });
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  
  // Preferences State
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    agencyId: '',
    preferredServiceAreas: [],
    preferredTransportLevels: ['BLS', 'ALS'],
    maxDistance: 200,
    preferredTimeWindows: [],
    revenueThreshold: 100
  });
  
  // History State
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [analytics, setAnalytics] = useState<MatchAnalytics>({
    totalBids: 0,
    acceptedBids: 0,
    totalRevenue: 0,
    acceptanceRate: 0,
    averageRevenue: 0
  });

  // Demo facilities for testing
  const demoFacilities = [
    { id: 'facility-001', name: 'UPMC Altoona Hospital', city: 'Altoona', state: 'PA' },
    { id: 'facility-002', name: 'Penn Highlands Dubois', city: 'Dubois', state: 'PA' },
    { id: 'facility-003', name: 'Conemaugh Memorial Medical Center', city: 'Johnstown', state: 'PA' },
    { id: 'facility-004', name: 'UPMC Presbyterian', city: 'Pittsburgh', state: 'PA' },
    { id: 'facility-005', name: 'Geisinger Medical Center', city: 'Danville', state: 'PA' }
  ];

  // Find matching agencies
  const handleFindMatches = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const userRole = localStorage.getItem('userRole');
      const agencyToken = localStorage.getItem('agencyToken');
      const adminToken = localStorage.getItem('token');
      
      // Smart token selection based on user role
      const authHeader = userRole === 'ADMIN' 
        ? `Bearer ${adminToken}`
        : `Bearer ${agencyToken}`;
      
      // Use the main endpoint for authenticated users, demo endpoint for unauthenticated
      const endpoint = authHeader && authHeader !== 'Bearer null' 
        ? '/api/matching/find-matches'
        : '/api/matching/demo/find-matches';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authHeader && authHeader !== 'Bearer null') {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(matchingCriteria),
      });

      const result = await response.json();

      if (result.success) {
        setMatchingResults(result.data.matches);
      } else {
        setError(result.message || 'Failed to find matches');
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const agencyToken = localStorage.getItem('agencyToken');
      const adminToken = localStorage.getItem('token');
      
      // Smart token selection based on user role
      const authHeader = userRole === 'ADMIN' 
        ? `Bearer ${adminToken}`
        : `Bearer ${agencyToken}`;
      
      if (!authHeader || authHeader === 'Bearer null') {
        // Use demo data for now
        setPreferences({
          agencyId: 'demo-agency-001',
          preferredServiceAreas: ['facility-001', 'facility-002'],
          preferredTransportLevels: ['BLS', 'ALS', 'CCT'],
          maxDistance: 200,
          preferredTimeWindows: [
            { dayOfWeek: 0, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 6, startTime: '08:00', endTime: '18:00' }
          ],
          revenueThreshold: 100
        });
        return;
      }

      const response = await fetch('/api/matching/preferences', {
        headers: {
          'Authorization': authHeader,
        },
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Load match history
  const loadMatchHistory = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const agencyToken = localStorage.getItem('agencyToken');
      const adminToken = localStorage.getItem('token');
      
      // Smart token selection based on user role
      const authHeader = userRole === 'ADMIN' 
        ? `Bearer ${adminToken}`
        : `Bearer ${agencyToken}`;
      
      if (!authHeader || authHeader === 'Bearer null') {
        // Use demo data for now
        const demoHistory = [
          {
            bidId: 'bid-001',
            transportRequest: {
              originFacility: { name: 'UPMC Altoona Hospital' },
              destinationFacility: { name: 'Penn Highlands Dubois' },
              transportLevel: 'ALS',
              priority: 'HIGH'
            },
            status: 'ACCEPTED',
            submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            revenue: 280
          },
          {
            bidId: 'bid-002',
            transportRequest: {
              originFacility: { name: 'Conemaugh Memorial Medical Center' },
              destinationFacility: { name: 'UPMC Presbyterian' },
              transportLevel: 'CCT',
              priority: 'URGENT'
            },
            status: 'ACCEPTED',
            submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
            revenue: 450
          },
          {
            bidId: 'bid-003',
            transportRequest: {
              originFacility: { name: 'Geisinger Medical Center' },
              destinationFacility: { name: 'UPMC Altoona Hospital' },
              transportLevel: 'BLS',
              priority: 'MEDIUM'
            },
            status: 'PENDING',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            revenue: 180
          }
        ];
        
        setMatchHistory(demoHistory);
        
        const totalBids = demoHistory.length;
        const acceptedBids = demoHistory.filter(bid => bid.status === 'ACCEPTED').length;
        const totalRevenue = demoHistory
          .filter(bid => bid.status === 'ACCEPTED')
          .reduce((sum, bid) => sum + bid.revenue, 0);
        
        setAnalytics({
          totalBids,
          acceptedBids,
          totalRevenue,
          acceptanceRate: Math.round((acceptedBids / totalBids) * 100),
          averageRevenue: acceptedBids > 0 ? Math.round(totalRevenue / acceptedBids) : 0
        });
        return;
      }

      const response = await fetch('/api/matching/history', {
        headers: {
          'Authorization': authHeader,
        },
      });

      const result = await response.json();

      if (result.success) {
        setMatchHistory(result.data.history);
        setAnalytics(result.data.analytics);
      }
    } catch (error) {
      console.error('Error loading match history:', error);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const agencyToken = localStorage.getItem('agencyToken');
      const adminToken = localStorage.getItem('token');
      
      // Smart token selection based on user role
      const authHeader = userRole === 'ADMIN' 
        ? `Bearer ${adminToken}`
        : `Bearer ${agencyToken}`;
      
      if (!authHeader || authHeader === 'Bearer null') {
        // For demo, just update local state
        setPreferences(prev => ({ ...prev }));
        return;
      }

      const response = await fetch('/api/matching/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    loadPreferences();
    loadMatchHistory();
  }, []);

  const handleInputChange = (field: keyof MatchingCriteria, value: any) => {
    setMatchingCriteria(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Matching System</h1>
        <p className="text-gray-600">
          Intelligent agency-request matching with capability-based filtering, geographic proximity, and revenue optimization.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'find-matches', label: 'Find Matches' },
            { id: 'preferences', label: 'Matching Preferences' },
            { id: 'history', label: 'Match History & Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Find Matches Tab */}
      {activeTab === 'find-matches' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transport Request Criteria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Level
                </label>
                <select
                  value={matchingCriteria.transportLevel}
                  onChange={(e) => handleInputChange('transportLevel', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BLS">BLS - Basic Life Support</option>
                  <option value="ALS">ALS - Advanced Life Support</option>
                  <option value="CCT">CCT - Critical Care Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin Facility
                </label>
                <select
                  value={matchingCriteria.originFacilityId}
                  onChange={(e) => handleInputChange('originFacilityId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Origin Facility</option>
                  {demoFacilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} - {facility.city}, {facility.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Facility
                </label>
                <select
                  value={matchingCriteria.destinationFacilityId}
                  onChange={(e) => handleInputChange('destinationFacilityId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Destination Facility</option>
                  {demoFacilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} - {facility.city}, {facility.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={matchingCriteria.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Distance (miles)
                </label>
                <input
                  type="number"
                  value={matchingCriteria.estimatedDistance || ''}
                  onChange={(e) => handleInputChange('estimatedDistance', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter distance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <input
                  type="text"
                  value={matchingCriteria.specialRequirements || ''}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ventilator, ICU nurse"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleFindMatches}
                disabled={isLoading || !matchingCriteria.originFacilityId || !matchingCriteria.destinationFacilityId}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Finding Matches...' : 'Find Matching Agencies'}
              </button>
            </div>
          </div>

          {/* Matching Results */}
          {matchingResults.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Matching Results ({matchingResults.length} agencies found)
              </h2>
              
              <div className="space-y-4">
                {matchingResults.map((result, index) => (
                  <div key={result.agency.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {result.agency.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(result.matchingScore)}`}>
                            Score: {result.matchingScore}
                          </span>
                          {result.isLDT && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              LDT
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Revenue Potential:</span>
                            <span className="ml-2 text-green-600 font-semibold">${result.revenuePotential}</span>
                          </div>
                          <div>
                            <span className="font-medium">Estimated Arrival:</span>
                            <span className="ml-2">{new Date(result.estimatedArrival).toLocaleTimeString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">Unit Status:</span>
                            <span className="ml-2">{result.unitAvailability.status}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Matching Reasons:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Matching Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Transport Levels
              </label>
              <div className="space-y-2">
                {['BLS', 'ALS', 'CCT'].map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.preferredTransportLevels.includes(level as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            preferredTransportLevels: [...prev.preferredTransportLevels, level as any]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            preferredTransportLevels: prev.preferredTransportLevels.filter(l => l !== level)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance (miles)
              </label>
              <input
                type="number"
                value={preferences.maxDistance}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Threshold ($)
              </label>
              <input
                type="number"
                value={preferences.revenueThreshold}
                onChange={(e) => setPreferences(prev => ({ ...prev, revenueThreshold: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUpdatePreferences}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Preferences
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Analytics Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Performance Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalBids}</div>
                <div className="text-sm text-gray-600">Total Bids</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.acceptedBids}</div>
                <div className="text-sm text-gray-600">Accepted Bids</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.acceptanceRate}%</div>
                <div className="text-sm text-gray-600">Acceptance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">${analytics.totalRevenue}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">${analytics.averageRevenue}</div>
                <div className="text-sm text-gray-600">Average Revenue</div>
              </div>
            </div>
          </div>

          {/* Match History */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Match History</h2>
            
            <div className="space-y-4">
              {matchHistory.map((match) => (
                <div key={match.bidId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {match.transportRequest.originFacility.name} → {match.transportRequest.destinationFacility.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          match.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          match.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Transport Level:</span>
                          <span className="ml-2">{match.transportRequest.transportLevel}</span>
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span>
                          <span className="ml-2">{match.transportRequest.priority}</span>
                        </div>
                        <div>
                          <span className="font-medium">Revenue:</span>
                          <span className="ml-2 text-green-600 font-semibold">${match.revenue}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted: {new Date(match.submittedAt).toLocaleString()}
                        {match.acceptedAt && (
                          <span className="ml-4">
                            Accepted: {new Date(match.acceptedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingSystem;
