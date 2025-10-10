import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Truck, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Bell,
  DollarSign,
  Navigation
} from 'lucide-react';
import Notifications from './Notifications';
import Overview from './Overview';
import TripsView from './TripsView';
import Hospitals from './Hospitals';
import Agencies from './Agencies';
import HealthcarePortal from './HealthcarePortal';
import EMSDashboard from './EMSDashboard';
import NotificationSettings from './NotificationSettings';
import UserManagement from './UserManagement';
import FinancialDashboard from './FinancialDashboard';
import TCCUnitsManagement from './TCCUnitsManagement';
import TCCRouteOptimizer from './TCCRouteOptimizer';
import Analytics from './Analytics';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Overview', href: '/dashboard', icon: Home },
      { name: 'Trips', href: '/dashboard/trips', icon: Truck },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Units', href: '/dashboard/units', icon: Truck },
      { name: 'Healthcare Facilities', href: '/dashboard/hospitals', icon: Building2 },
      { name: 'EMS Agencies', href: '/dashboard/agencies', icon: Truck },
      { name: 'Route Optimization', href: '/dashboard/route-optimization', icon: Navigation },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    ];

    // Admin users see all tabs including Financial and Settings
    if (user.userType === 'ADMIN') {
      // Insert Financial right after Analytics
      const navWithFinancial = [
        ...baseNavigation.slice(0, 3), // Overview, Trips, Analytics
        { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
        ...baseNavigation.slice(3), // Units, Healthcare, EMS, Route, Notifications
        { name: 'Settings', href: '/dashboard/settings', icon: Menu },
      ];
      return navWithFinancial;
    } 
    
    // Regular users see all tabs except Settings and Financial
    return baseNavigation;
  };

  const navigation = getNavigation();

  const currentPage = navigation.find(item => 
    location.pathname === item.href || 
    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  )?.name || 'Overview';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TCC</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">TCC</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="mt-2 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <span className="text-lg font-semibold text-gray-900">
                      {currentPage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications user={user} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/trips" element={<TripsView user={user} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/units" element={<TCCUnitsManagement />} />
                <Route path="/hospitals/*" element={<Hospitals />} />
                <Route path="/agencies/*" element={<Agencies />} />
                <Route path="/route-optimization" element={<TCCRouteOptimizer />} />
                <Route path="/healthcare-portal" element={<HealthcarePortal />} />
                <Route path="/ems-dashboard" element={<EMSDashboard user={user} onLogout={onLogout} />} />
                <Route path="/notifications" element={<NotificationSettings />} />
                <Route path="/settings" element={<UserManagement />} />
                <Route path="/financial" element={<FinancialDashboard />} />
                <Route path="/my-trips" element={<div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900">My Trips</h3><p className="text-gray-500">Coming soon...</p></div>} />
                <Route path="/my-assignments" element={<div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900">My Assignments</h3><p className="text-gray-500">Coming soon...</p></div>} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TCCDashboard;
