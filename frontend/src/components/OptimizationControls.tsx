import React, { useState } from 'react';
import { RouteOptimizationRequest } from '../pages/RouteOptimization';

interface OptimizationControlsProps {
  optimizationRequest: RouteOptimizationRequest;
  onOptimizationRequest: (request: RouteOptimizationRequest) => void;
  isOptimizing: boolean;
  onBack: () => void;
}

const OptimizationControls: React.FC<OptimizationControlsProps> = ({
  optimizationRequest,
  onOptimizationRequest,
  isOptimizing,
  onBack
}) => {
  const [request, setRequest] = useState<RouteOptimizationRequest>(optimizationRequest);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transportLevels = ['BLS', 'ALS', 'CCT'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const optimizationTypes = ['TEMPORAL', 'GEOGRAPHIC', 'RETURN_TRIP', 'MULTI_STOP', 'CHAINED_TRIPS', 'REVENUE_MAX'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!request.timeWindowStart) {
      newErrors.timeWindowStart = 'Start time is required';
    }
    if (!request.timeWindowEnd) {
      newErrors.timeWindowEnd = 'End time is required';
    }
    if (request.timeWindowStart && request.timeWindowEnd && 
        request.timeWindowStart >= request.timeWindowEnd) {
      newErrors.timeWindowEnd = 'End time must be after start time';
    }
    if (request.constraints?.maxDuration && request.constraints.maxDuration <= 0) {
      newErrors.maxDuration = 'Max duration must be greater than 0';
    }
    if (request.constraints?.maxStops && request.constraints.maxStops <= 0) {
      newErrors.maxStops = 'Max stops must be greater than 0';
    }
    if (request.constraints?.minRevenue && request.constraints.minRevenue < 0) {
      newErrors.minRevenue = 'Min revenue cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onOptimizationRequest(request);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setRequest(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleConstraintChange = (field: string, value: any) => {
    setRequest(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTransportLevelChange = (level: string) => {
    setRequest(prev => ({
      ...prev,
      transportLevels: prev.transportLevels?.includes(level)
        ? prev.transportLevels.filter(l => l !== level)
        : [...(prev.transportLevels || []), level]
    }));
  };

  const handlePriorityChange = (priority: string) => {
    setRequest(prev => ({
      ...prev,
      priorities: prev.priorities?.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...(prev.priorities || []), priority]
    }));
  };

  const getPresetTimeWindows = () => {
    const now = new Date();
    return [
      { label: 'Next 4 hours', start: now, end: new Date(now.getTime() + 4 * 60 * 60 * 1000) },
      { label: 'Next 8 hours', start: now, end: new Date(now.getTime() + 8 * 60 * 60 * 1000) },
      { label: 'Next 12 hours', start: now, end: new Date(now.getTime() + 12 * 60 * 60 * 1000) },
      { label: 'Next 24 hours', start: now, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      { label: 'Today (6 AM - 6 PM)', start: new Date(now.setHours(6, 0, 0, 0)), end: new Date(now.setHours(18, 0, 0, 0)) },
      { label: 'Tomorrow (6 AM - 6 PM)', start: new Date(now.getTime() + 24 * 60 * 60 * 1000), end: new Date(now.getTime() + 36 * 60 * 60 * 1000) },
    ];
  };

  const applyPresetTimeWindow = (preset: { start: Date; end: Date }) => {
    setRequest(prev => ({
      ...prev,
      timeWindowStart: preset.start,
      timeWindowEnd: preset.end
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Optimization Configuration</h3>
          <p className="mt-1 text-sm text-gray-600">
            Configure parameters for route optimization and chaining analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Time Window Configuration */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Time Window Configuration</h4>
            
            {/* Preset Time Windows */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getPresetTimeWindows().map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyPresetTimeWindow(preset)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeWindowStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="timeWindowStart"
                  value={request.timeWindowStart ? request.timeWindowStart.toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('timeWindowStart', new Date(e.target.value))}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.timeWindowStart ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.timeWindowStart && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeWindowStart}</p>
                )}
              </div>

              <div>
                <label htmlFor="timeWindowEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="timeWindowEnd"
                  value={request.timeWindowEnd ? request.timeWindowEnd.toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('timeWindowEnd', new Date(e.target.value))}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.timeWindowEnd ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.timeWindowEnd && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeWindowEnd}</p>
                )}
              </div>
            </div>
          </div>

          {/* Transport Level and Priority Filters */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Request Filters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Levels
                </label>
                <div className="space-y-2">
                  {transportLevels.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={request.transportLevels?.includes(level) || false}
                        onChange={() => handleTransportLevelChange(level)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorities
                </label>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={request.priorities?.includes(priority) || false}
                        onChange={() => handlePriorityChange(priority)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Type */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Optimization Focus</h4>
            
            <div>
              <label htmlFor="optimizationType" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Optimization Type
              </label>
              <select
                id="optimizationType"
                value={request.optimizationType || ''}
                onChange={(e) => handleInputChange('optimizationType', e.target.value || undefined)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types (Recommended)</option>
                {optimizationTypes.map((type) => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Leave as "All Types" for comprehensive optimization analysis
              </p>
            </div>
          </div>

          {/* Constraints */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Optimization Constraints</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Route Duration (minutes)
                </label>
                <input
                  type="number"
                  id="maxDuration"
                  value={request.constraints?.maxDuration || ''}
                  onChange={(e) => handleConstraintChange('maxDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="240"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.maxDuration ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.maxDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxDuration}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Maximum time for a single optimized route
                </p>
              </div>

              <div>
                <label htmlFor="maxStops" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Stops per Route
                </label>
                <input
                  type="number"
                  id="maxStops"
                  value={request.constraints?.maxStops || ''}
                  onChange={(e) => handleConstraintChange('maxStops', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="10"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.maxStops ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.maxStops && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStops}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of stops in a single route
                </p>
              </div>

              <div>
                <label htmlFor="minRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Revenue Increase ($)
                </label>
                <input
                  type="number"
                  id="minRevenue"
                  value={request.constraints?.minRevenue || ''}
                  onChange={(e) => handleConstraintChange('minRevenue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="25"
                  step="0.01"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.minRevenue ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.minRevenue && (
                  <p className="mt-1 text-sm text-red-600">{errors.minRevenue}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Minimum revenue increase to consider an opportunity
                </p>
              </div>

              <div>
                <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Route Distance (miles)
                </label>
                <input
                  type="number"
                  id="maxDistance"
                  value={request.maxDistance || ''}
                  onChange={(e) => handleInputChange('maxDistance', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="500"
                  step="0.1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum total distance for optimized routes
                </p>
              </div>
            </div>

            {/* Boolean Constraints */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preferReturnTrips"
                  checked={request.constraints?.preferReturnTrips || false}
                  onChange={(e) => handleConstraintChange('preferReturnTrips', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="preferReturnTrips" className="ml-2 text-sm text-gray-700">
                  Prefer return trip opportunities
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="avoidHighways"
                  checked={request.constraints?.avoidHighways || false}
                  onChange={(e) => handleConstraintChange('avoidHighways', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="avoidHighways" className="ml-2 text-sm text-gray-700">
                  Avoid highway routes when possible
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOptimizing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Optimization
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptimizationControls;
