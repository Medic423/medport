import React from 'react';
import { Polyline } from '@react-google-maps/api';
import { LatLng } from '../utils/mapBounds';

interface TripPolylineProps {
  tripId: string;
  pickupCoords: LatLng | null;
  destinationCoords: LatLng | null;
  status: string;
  onClick?: () => void;
}

const getColorByStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
    case 'PENDING_DISPATCH':
      return '#3B82F6'; // blue
    case 'ACCEPTED':
    case 'IN_PROGRESS':
      return '#10B981'; // green
    case 'COMPLETED':
    case 'HEALTHCARE_COMPLETED':
      return '#6B7280'; // gray
    case 'DECLINED':
    case 'CANCELLED':
      return '#EF4444'; // red
    default:
      return '#8B5CF6'; // purple
  }
};

const TripPolyline: React.FC<TripPolylineProps> = ({
  tripId,
  pickupCoords,
  destinationCoords,
  status,
  onClick
}) => {
  if (!pickupCoords || !destinationCoords) {
    return null;
  }

  const path = [pickupCoords, destinationCoords];
  const color = getColorByStatus(status);

  return (
    <Polyline
      key={tripId}
      path={path}
      options={{
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        clickable: !!onClick,
      }}
      onClick={onClick}
    />
  );
};

export default TripPolyline;
