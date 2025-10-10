import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedTripForm from './EnhancedTripForm';

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

  const handleTripCreated = () => {
    // Navigate back to trips view after successful creation
    navigate('/dashboard/trips');
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
    </div>
  );
};

export default TCCCreateTrip;
