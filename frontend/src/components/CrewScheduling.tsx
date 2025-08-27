import React, { useState, useEffect } from 'react';

interface CrewMember {
  id: string;
  name: string;
  role: 'DRIVER' | 'EMT' | 'PARAMEDIC' | 'NURSE';
  certification: string;
  availability: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY' | 'ON_BREAK';
  currentLocation?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

interface CrewAssignment {
  id: string;
  crewMemberId: string;
  transportRequestId: string;
  assignmentTime: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

const CrewScheduling: React.FC = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [assignments, setAssignments] = useState<CrewAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  useEffect(() => {
    loadCrewData();
  }, []);

  const loadCrewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for demo mode and get appropriate token
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      // Load crew members
      const crewResponse = await fetch('/api/agency/crew', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (crewResponse.ok) {
        const crewData = await crewResponse.json();
        setCrewMembers(crewData.crewMembers || []);
      }

      // Load assignments
      const assignmentResponse = await fetch('/api/agency/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        setAssignments(assignmentData.assignments || []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load crew data';
      console.error('[MedPort:CrewScheduling] Error loading crew data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCrewMemberSelect = (crewMember: CrewMember) => {
    setSelectedCrewMember(crewMember);
    setShowAssignmentForm(true);
  };

  const handleAssignmentSubmit = async (assignmentData: any) => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const token = isDemoMode ? 'demo-agency-token' : localStorage.getItem('token');

      const response = await fetch('/api/agency/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        alert('Crew assignment created successfully!');
        setShowAssignmentForm(false);
        setSelectedCrewMember(null);
        loadCrewData(); // Refresh data
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      console.error('[MedPort:CrewScheduling] Error creating assignment:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create assignment'}`);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'OFF_DUTY': return 'bg-gray-100 text-gray-800';
      case 'ON_BREAK': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DRIVER': return 'bg-blue-100 text-blue-800';
      case 'EMT': return 'bg-green-100 text-green-800';
      case 'PARAMEDIC': return 'bg-purple-100 text-purple-800';
      case 'NURSE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading crew scheduling data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Crew Data</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={loadCrewData}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crew Scheduling</h1>
          <p className="mt-2 text-gray-600">
            Manage transport crew assignments, availability, and scheduling
          </p>
        </div>

        {/* Crew Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {crewMembers.map((crewMember) => (
            <div
              key={crewMember.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCrewMemberSelect(crewMember)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{crewMember.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(crewMember.role)}`}>
                  {crewMember.role}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Certification:</span>
                  <span className="text-sm font-medium text-gray-900">{crewMember.certification}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(crewMember.availability)}`}>
                    {crewMember.availability.replace('_', ' ')}
                  </span>
                </div>

                {crewMember.currentLocation && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="text-sm font-medium text-gray-900">{crewMember.currentLocation}</span>
                  </div>
                )}

                {crewMember.shiftStart && crewMember.shiftEnd && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Shift:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(crewMember.shiftStart).toLocaleTimeString()} - {new Date(crewMember.shiftEnd).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignments</h2>
          
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active crew assignments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crew Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transport Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => {
                    const crewMember = crewMembers.find(cm => cm.id === assignment.crewMemberId);
                    return (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {crewMember?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.transportRequestId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.assignmentTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrewScheduling;
