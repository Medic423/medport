import React, { useState, useEffect } from 'react';
import ResourceDashboard from '../components/ResourceDashboard';
import { useAuth } from '../hooks/useAuth';

const ResourceManagement: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we should be in demo mode (no token or demo flag)
    const token = localStorage.getItem('token');
    const demoFlag = localStorage.getItem('demoMode');
    setIsDemoMode(!token || demoFlag === 'true');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated and not in demo mode, show demo mode
  if (!isAuthenticated && !isDemoMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource Management</h2>
            <p className="text-gray-600 mb-6">
              View real-time resource availability, CCT unit status, and capacity planning.
            </p>
            <button
              onClick={() => setIsDemoMode(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResourceDashboard isDemoMode={isDemoMode} />
    </div>
  );
};

export default ResourceManagement;
