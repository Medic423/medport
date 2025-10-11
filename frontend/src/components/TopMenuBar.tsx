import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Building2, 
  Truck, 
  Settings, 
  BarChart3,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface TopMenuBarProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  onLogout: () => void;
}

const TopMenuBar: React.FC<TopMenuBarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('TCC_DEBUG: TopMenuBar component rendering');
  console.log('TCC_DEBUG: TopMenuBar user:', user);

  const menuItems = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: BarChart3,
      hasDropdown: false
    },
    {
      label: 'Healthcare',
      icon: Building2,
      hasDropdown: true,
      items: [
        { label: 'Facilities List', path: '/dashboard/healthcare/facilities' },
        { label: 'Add Facility', path: '/healthcare-register' },
      ]
    },
    {
      label: 'EMS',
      icon: Truck,
      hasDropdown: true,
      items: [
        { label: 'Agencies List', path: '/dashboard/ems/agencies' },
        { label: 'Add Agency', path: '/ems-register' },
        { label: 'Units Management', path: '/dashboard/ems/units' },
      ]
    },
    {
      label: 'Operations',
      icon: Settings,
      hasDropdown: true,
      items: [
        { label: 'Trip Management', path: '/dashboard/operations/trips' },
        { label: 'Route Optimization', path: '/dashboard/operations/route-optimization' },
        { label: 'Analytics & Financial', path: '/dashboard/operations/analytics' },
      ]
    }
  ];

  const handleNavigation = (path: string) => {
    console.log('TCC_DEBUG: TopMenuBar handleNavigation called with path:', path);
    // Handle external registration pages (outside dashboard context)
    if (path === '/healthcare-register' || path === '/ems-register') {
      console.log('TCC_DEBUG: TopMenuBar navigating to external page:', path);
      const targetUrl = window.location.origin + path;
      console.log('TCC_DEBUG: TopMenuBar target URL:', targetUrl);
      window.location.href = targetUrl;
    } else {
      console.log('TCC_DEBUG: TopMenuBar navigating internally to:', path);
      navigate(path);
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/healthcare')) return 'Healthcare';
    if (path.startsWith('/dashboard/ems')) return 'EMS';
    if (path.startsWith('/dashboard/operations')) return 'Operations';
    if (path === '/dashboard') return 'Overview';
    return null;
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Desktop Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                TCC Command Center
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        getActiveSection() === item.label
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        {item.items?.map((subItem) => (
                          <button
                            key={subItem.path}
                            type="button"
                            onClick={(e) => {
                              console.log(`TCC_DEBUG: TopMenuBar dropdown item clicked: ${subItem.label} -> ${subItem.path}`);
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavigation(subItem.path);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              isActivePath(subItem.path)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-500">{user.userType}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Menu Items */}
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        getActiveSection() === item.label
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Mobile Dropdown */}
                    {activeDropdown === item.label && (
                      <div className="pl-8 space-y-1">
                        {item.items?.map((subItem) => (
                          <button
                            key={subItem.path}
                            onClick={() => handleNavigation(subItem.path)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                              isActivePath(subItem.path)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}

            {/* Mobile User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-500">{user.userType}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click Outside Handler */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default TopMenuBar;
