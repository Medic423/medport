import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Building2, 
  Truck, 
  Settings, 
  Calculator,
  User,
  LogOut,
  Menu,
  X,
  Home,
  List,
  HelpCircle
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import { HelpModal } from './HelpSystem';
import TrialStatusBadge from './TrialStatusBadge';

interface TopMenuBarProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  onLogout: () => void;
  onClearSession?: () => void;
}

const TopMenuBar: React.FC<TopMenuBarProps> = ({ user, onLogout, onClearSession }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string | null>(null);
  // First-login enforcement: auto-open Change Password if flagged
  // Check on mount and whenever the user changes (post-login)
  useEffect(() => {
    try {
      const flag = localStorage.getItem('mustChangePassword');
      if (flag === 'true') {
        setShowChangePassword(true);
        localStorage.removeItem('mustChangePassword');
      }
    } catch {}
  }, [user?.id]);

  console.log('TCC_DEBUG: TopMenuBar component rendering');
  console.log('TCC_DEBUG: TopMenuBar user:', user);

  const menuItems = [
    {
      label: 'Trip Management',
      icon: List,
      hasDropdown: false,
      path: '/dashboard/operations/trips'
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
        // Units Management disabled - see docs/active/sessions/2026-01/units-management-disabled.md
        // { label: 'Units Management', path: '/dashboard/ems/units' },
        { label: 'Route Optimization', path: '/dashboard/operations/route-optimization' },
        { label: 'Trip Calculator', path: '/dashboard/operations/analytics' },
      ]
    },
    {
      label: 'Help',
      icon: HelpCircle,
      hasDropdown: false,
      path: 'HELP' // Special path to trigger help modal
    },
    ...(user.userType === 'ADMIN' ? [{
      label: 'Admin Users',
      icon: Settings,
      hasDropdown: true,
      items: [
        { label: 'Manage Users', path: '/dashboard/admin/users' },
        { label: 'Change Password', path: 'CHANGE_PASSWORD' } // Special path to trigger modal
      ]
    }] : [])
  ];

  const handleNavigation = (path: string) => {
    console.log('TCC_DEBUG: TopMenuBar handleNavigation called with path:', path);
    
    // Handle special actions
    if (path === 'CHANGE_PASSWORD') {
      setShowChangePassword(true);
      setActiveDropdown(null);
      setMobileMenuOpen(false);
      return;
    }
    
    if (path === 'HELP') {
      // Determine help topic based on current route
      const pathToTopic: Record<string, string> = {
        '/dashboard/operations/trips': 'trip-management',
        '/dashboard/healthcare/facilities': 'healthcare-facilities',
        '/dashboard/ems/agencies': 'ems-agencies',
        // '/dashboard/ems/units': 'units', // Units Management disabled
        '/dashboard/operations/route-optimization': 'route-optimization',
        '/dashboard/operations/analytics': 'analytics',
        '/dashboard/admin/users': 'user-management',
      };
      const currentPath = location.pathname;
      setHelpTopic(pathToTopic[currentPath] || 'index');
      setShowHelp(true);
      setActiveDropdown(null);
      setMobileMenuOpen(false);
      return;
    }
    
    // Handle external registration pages (outside dashboard context)
    if (path === '/healthcare-register' || path === '/ems-register') {
      console.log('TCC_DEBUG: TopMenuBar navigating to external page:', path);
      // Clear session and navigate immediately to avoid flash
      if (onClearSession) {
        console.log('TCC_DEBUG: TopMenuBar clearing session and navigating immediately');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = path;
      } else {
        console.log('TCC_DEBUG: TopMenuBar onClearSession not available, using direct navigation');
        window.location.href = path;
      }
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
    return location.pathname.startsWith(path);
  };

  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return null;
    if (path.startsWith('/dashboard/operations/trips')) return 'Trip Management';
    if (path.startsWith('/dashboard/healthcare')) return 'Healthcare';
    if (path.startsWith('/dashboard/ems')) return 'EMS';
    if (path.startsWith('/dashboard/operations/route-optimization')) return 'EMS'; // Route Optimization moved to EMS
    if (path.startsWith('/dashboard/operations/analytics')) return 'EMS'; // Trip Calculator moved to EMS dropdown
    if (path.startsWith('/dashboard/operations')) return 'EMS'; // Other operations routes
    if (path.startsWith('/dashboard/admin/users')) return 'Admin Users';
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
                Command
              </span>
            </div>
            
            {/* Home Button */}
            <button
              onClick={() => handleNavigation('/')}
              className="ml-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Home - Quick Actions"
            >
              <Home className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className={`flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
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
                              console.log(`TCC_DEBUG: TopMenuBar current location:`, location.pathname);
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
                    className={`flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
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
            {/* Trial Status Badge */}
            <TrialStatusBadge userId={user.id} userType={user.userType} />
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 flex items-center space-x-2">
                  <span>{user.name}</span>
                  {/* Org Admin badge for Healthcare/EMS when present */}
                  {(() => {
                    try {
                      const raw = localStorage.getItem('user');
                      const u = raw ? JSON.parse(raw) : null;
                      const isOrgAdmin = !!u?.orgAdmin && (u?.userType === 'HEALTHCARE' || u?.userType === 'EMS');
                      return isOrgAdmin ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">Org Admin</span>
                      ) : null;
                    } catch { return null; }
                  })()}
                </div>
                <div className="text-gray-500">{user.email}</div>
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

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
        userName={user.name}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        userType="ADMIN"
        topic={helpTopic || undefined}
      />
    </div>
  );
};

export default TopMenuBar;
