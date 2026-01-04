import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopMenuBar from './TopMenuBar';
import TCCOverview from './TCCOverview';
import TripsView from './TripsView';
import TCCCreateTrip from './TCCCreateTrip';
import Hospitals from './Hospitals';
import TCCHospitalSettings from './TCCHospitalSettings';
import Agencies from './Agencies';
// Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md
// import TCCUnitsManagement from './TCCUnitsManagement';
import TCCRouteOptimizer from './TCCRouteOptimizer';
// import EnhancedRouteOptimizer from './EnhancedRouteOptimizer'; // Temporarily disabled - file deleted during cleanup
import Analytics from './Analytics';
import AdminUsersPanel from './AdminUsersPanel';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
  facilityName?: string;
  facilityType?: string;
  agencyName?: string;
}

interface TCCDashboardProps {
  user: User;
  onLogout: () => void;
}

const TCCDashboard: React.FC<TCCDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Menu Bar */}
      <TopMenuBar user={user} onLogout={onLogout} onClearSession={onLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Overview */}
          <Route path="/" element={<TCCOverview user={user} onClearSession={onLogout} />} />
          
          {/* Healthcare Management */}
          <Route path="/healthcare/facilities" element={<Hospitals />} />
          <Route path="/healthcare/facilities/:facilityId/settings" element={<TCCHospitalSettings user={user} />} />
          
          {/* EMS Management */}
          <Route path="/ems/agencies" element={<Agencies />} />
          {/* Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md */}
          {/* <Route path="/ems/units" element={<TCCUnitsManagement />} /> */}
          
          {/* Operations */}
          <Route path="/operations/trips" element={<TripsView user={user} />} />
          <Route path="/operations/trips/create" element={<TCCCreateTrip user={user} />} />
          <Route path="/operations/route-optimization" element={<TCCRouteOptimizer />} />
          {/* <Route path="/operations/route-optimization-enhanced" element={<EnhancedRouteOptimizer />} /> */}
          <Route path="/operations/analytics" element={<Analytics />} />
          <Route path="/admin/users" element={<AdminUsersPanel />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/trips" element={<TripsView user={user} />} />
          <Route path="/trips/create" element={<TCCCreateTrip user={user} />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/:facilityId/settings" element={<TCCHospitalSettings user={user} />} />
          <Route path="/agencies/*" element={<Agencies />} />
          {/* Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md */}
          {/* <Route path="/units" element={<TCCUnitsManagement />} /> */}
          <Route path="/route-optimization" element={<TCCRouteOptimizer />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default TCCDashboard;