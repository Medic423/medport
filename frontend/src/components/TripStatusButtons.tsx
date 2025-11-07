import React from 'react';

interface TripStatusButtonsProps {
  tripId: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  onUpdate: (tripId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED') => void;
}

const TripStatusButtons: React.FC<TripStatusButtonsProps> = ({ tripId, status, onUpdate }) => {
  return (
    <div className="ml-4 flex space-x-2">
      {status === 'ACCEPTED' && (
        <button
          onClick={() => onUpdate(tripId, 'IN_PROGRESS')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Start Trip
        </button>
      )}
      {status === 'IN_PROGRESS' && (
        <button
          onClick={() => onUpdate(tripId, 'COMPLETED')}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
        >
          Complete Trip
        </button>
      )}
    </div>
  );
};

export default TripStatusButtons;


