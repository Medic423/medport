import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedTripForm from './EnhancedTripForm';
import TripDispatchScreen from './TripDispatchScreen';
import { tripsAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  facilityName?: string;
}

interface TCCCreateTripProps {
  user: User;
}

const TCCCreateTrip: React.FC<TCCCreateTripProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showDispatchScreen, setShowDispatchScreen] = useState(false);
  const [dispatchTrip, setDispatchTrip] = useState<any>(null);

  const handleTripCreated = async (tripId?: string) => {
    // ✅ Match Healthcare module: If tripId provided, open dispatch screen
    if (tripId) {
      try {
        const response = await tripsAPI.getAll();
        const trip = response.data?.data?.find((t: any) => t.id === tripId);
        if (trip) {
          // Ensure trip has fromLocation/toLocation for dispatch screen
          const tripForDispatch = {
            ...trip,
            fromLocation: trip.fromLocation || trip.origin || 'Unknown Origin',
            toLocation: trip.toLocation || trip.destination || 'Unknown Destination',
            origin: trip.origin || trip.fromLocation,
            destination: trip.destination || trip.toLocation
          };
          setDispatchTrip(tripForDispatch);
          setShowDispatchScreen(true);
        } else {
          // Fallback: navigate to trips view
          navigate('/dashboard/trips');
        }
      } catch (error) {
        console.error('Error loading trip for dispatch:', error);
        // Fallback: navigate to trips view
        navigate('/dashboard/trips');
      }
    } else {
      // Fallback: navigate to trips view
      navigate('/dashboard/trips');
    }
  };

  const handleCancel = () => {
    // Navigate back to trips view when cancel is clicked
    navigate('/dashboard/trips');
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Transport Request</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new transport request on behalf of a healthcare facility.
          </p>
        </div>
        
        <EnhancedTripForm 
          user={user} 
          onTripCreated={handleTripCreated}
          onCancel={handleCancel}
        />
      </div>

      {/* ✅ Dispatch Screen Modal - Match Healthcare module functionality */}
      {showDispatchScreen && dispatchTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TripDispatchScreen
              tripId={dispatchTrip.id}
              trip={dispatchTrip}
              user={user}
              onDispatchComplete={() => {
                setShowDispatchScreen(false);
                setDispatchTrip(null);
                navigate('/dashboard/trips'); // Navigate to trips view after dispatch
              }}
              onCancel={() => {
                setShowDispatchScreen(false);
                setDispatchTrip(null);
                navigate('/dashboard/trips'); // Navigate to trips view if cancelled
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TCCCreateTrip;
