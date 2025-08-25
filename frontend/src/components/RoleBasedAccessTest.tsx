import React from 'react';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';

const RoleBasedAccessTest: React.FC = () => {
  const {
    navigation,
    modules,
    loading,
    error,
    canAccessModule,
    getNavigationForCategory,
    getAvailableCategories
  } = useRoleBasedAccess();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role-based access data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error:</strong> {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!navigation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No navigation data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Role-Based Access Control Test
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Current Role</h3>
              <p className="text-blue-700">{navigation.role}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Permissions</h3>
              <p className="text-green-700">{navigation.permissions.length} permissions</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Available Categories</h3>
              <p className="text-purple-700">{getAvailableCategories().length} categories</p>
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Permissions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {navigation.permissions.map((permission, index) => (
              <div key={index} className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                {permission}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Structure */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Navigation Structure</h2>
          <div className="space-y-6">
            {navigation.navigation.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.children?.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">Path: {item.path}</p>
                      <div className="text-xs text-gray-500">
                        <p>Required: {item.requiredPermissions.join(', ')}</p>
                        <p>Visible to: {item.visibleToRoles.join(', ')}</p>
                        <p>Access: {canAccessModule(item.id) ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Access Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module Access Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Category:</strong> {module.category}</p>
                  <p><strong>Required:</strong> {module.requiredPermissions.join(', ')}</p>
                  <p><strong>Visible to:</strong> {module.visibleToRoles.join(', ')}</p>
                  <p><strong>Active:</strong> {module.isActive ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Access:</strong> {canAccessModule(module.id) ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Core Operations</h3>
              <div className="space-y-2">
                {getNavigationForCategory('Core Operations').map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-blue-700">{item.name}</span>
                    <span className={canAccessModule(item.id) ? 'text-green-600' : 'text-red-600'}>
                      {canAccessModule(item.id) ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Tools & Utilities</h3>
              <div className="space-y-2">
                {getNavigationForCategory('Tools & Utilities').map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-green-700">{item.name}</span>
                    <span className={canAccessModule(item.id) ? 'text-green-600' : 'text-red-600'}>
                      {canAccessModule(item.id) ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedAccessTest;
