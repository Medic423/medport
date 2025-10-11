import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Building2, 
  Truck, 
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Activity
} from 'lucide-react';

interface TCCOverviewProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  onClearSession?: () => void;
}

const TCCOverview: React.FC<TCCOverviewProps> = ({ user, onClearSession }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Create Trip',
      description: 'Create a new transport request',
      icon: Plus,
      onClick: () => navigate('/dashboard/operations/trips/create'),
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      title: 'Add Healthcare Facility',
      description: 'Register a new healthcare facility',
      icon: Building2,
      onClick: () => {
        console.log('TCC_DEBUG: Add Healthcare Facility button clicked');
        // Clear session to access public registration page
        if (onClearSession) {
          onClearSession();
          // Navigate to registration page after session is cleared
          setTimeout(() => {
            window.location.href = '/healthcare-register';
          }, 100);
        }
      },
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Add EMS Agency',
      description: 'Register a new EMS agency',
      icon: Truck,
      onClick: () => {
        console.log('TCC_DEBUG: Add EMS Agency button clicked');
        // Clear session to access public registration page
        if (onClearSession) {
          onClearSession();
          // Navigate to registration page after session is cleared
          setTimeout(() => {
            window.location.href = '/ems-register';
          }, 100);
        }
      },
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white'
    },
    {
      title: 'Route Optimization',
      description: 'Optimize transport routes',
      icon: MapPin,
      onClick: () => navigate('/dashboard/operations/route-optimization'),
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-white'
    }
  ];

  const statsCards = [
    {
      title: 'Active Trips',
      value: '15',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Healthcare Facilities',
      value: '9',
      change: '+1',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'EMS Agencies',
      value: '3',
      change: '0',
      changeType: 'neutral',
      icon: Truck,
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'Active Units',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className={`${action.color} ${action.textColor} p-4 rounded-lg transition-colors text-left group`}
            >
              <div className="flex items-center space-x-3">
                <action.icon className="h-6 w-6" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New trip created</p>
              <p className="text-sm text-gray-500">Patient ID: PY2GHKJE8 • Penn Highlands DuBois</p>
            </div>
            <span className="text-sm text-gray-500">2 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pickup location added</p>
              <p className="text-sm text-gray-500">Peds ICU • Penn Highlands DuBois</p>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Route optimized</p>
              <p className="text-sm text-gray-500">3 trips • 15% time reduction</p>
            </div>
            <span className="text-sm text-gray-500">3 hours ago</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Backend API</p>
              <p className="text-sm text-gray-500">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-sm text-gray-500">Connected & responsive</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">External Services</p>
              <p className="text-sm text-gray-500">All integrations healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCCOverview;
