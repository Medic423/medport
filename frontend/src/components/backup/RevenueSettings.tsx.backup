import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Calculator } from 'lucide-react';

interface RevenueSettings {
  baseRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  perMileRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  priorityMultipliers: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  specialRequirementsSurcharge: number;
  insuranceRates: {
    medicare: number;
    medicaid: number;
    private: number;
  };
}

interface RevenuePreview {
  standardRate: number;
  mileageRate: number;
  insuranceRate: number;
}

const RevenueSettings: React.FC = () => {
  const [settings, setSettings] = useState<RevenueSettings>({
    baseRates: {
      BLS: 150,
      ALS: 250,
      CCT: 400
    },
    perMileRates: {
      BLS: 2.5,
      ALS: 3.75,
      CCT: 5.0
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialRequirementsSurcharge: 50,
    insuranceRates: {
      medicare: 0.85,
      medicaid: 0.80,
      private: 1.0
    }
  });

  const [preview, setPreview] = useState<RevenuePreview>({
    standardRate: 0,
    mileageRate: 0,
    insuranceRate: 0
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Calculate preview when settings change
  useEffect(() => {
    calculatePreview();
  }, [settings]);

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('revenue_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('revenue_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const calculatePreview = () => {
    // Sample trip: ALS transport, MEDIUM priority, 15 miles, medicare insurance
    const transportLevel = 'ALS';
    const priority = 'MEDIUM';
    const distance = 15;
    const insurance = 'medicare';

    const baseRate = settings.baseRates[transportLevel as keyof typeof settings.baseRates];
    const priorityMultiplier = settings.priorityMultipliers[priority as keyof typeof settings.priorityMultipliers];
    const perMileRate = settings.perMileRates[transportLevel as keyof typeof settings.perMileRates];
    const insuranceMultiplier = settings.insuranceRates[insurance as keyof typeof settings.insuranceRates];

    const standardRate = baseRate * priorityMultiplier;
    const mileageRate = standardRate + (perMileRate * distance);
    const insuranceRate = mileageRate * insuranceMultiplier;

    setPreview({
      standardRate: Math.round(standardRate * 100) / 100,
      mileageRate: Math.round(mileageRate * 100) / 100,
      insuranceRate: Math.round(insuranceRate * 100) / 100
    });
  };

  const updateSetting = (category: keyof RevenueSettings, field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Revenue Calculation Settings</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Configure pricing rates and see real-time revenue projections.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Base Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Rates by Transport Level</h3>
            <div className="space-y-4">
              {Object.entries(settings.baseRates).map(([level, rate]) => (
                <div key={level} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {level} Base Rate ($):
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => updateSetting('baseRates', level, parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Per Mile Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Mile Rates</h3>
            <div className="space-y-4">
              {Object.entries(settings.perMileRates).map(([level, rate]) => (
                <div key={level} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {level} Per Mile ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => updateSetting('perMileRates', level, parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Priority Multipliers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Multipliers</h3>
            <div className="space-y-4">
              {Object.entries(settings.priorityMultipliers).map(([priority, multiplier]) => (
                <div key={priority} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {priority} Priority:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => updateSetting('priorityMultipliers', priority, parseFloat(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fees */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Fees</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Special Requirements Surcharge ($):
                </label>
                <input
                  type="number"
                  value={settings.specialRequirementsSurcharge}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    specialRequirementsSurcharge: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Insurance Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Rate Multipliers</h3>
            <div className="space-y-4">
              {Object.entries(settings.insuranceRates).map(([insurance, rate]) => (
                <div key={insurance} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {insurance.charAt(0).toUpperCase() + insurance.slice(1)}:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    value={rate}
                    onChange={(e) => updateSetting('insuranceRates', insurance, parseFloat(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Preview</h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Sample trip:</strong> ALS transport, MEDIUM priority, 15 miles, medicare insurance
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Standard Rate:</span>
                  <span className="text-lg font-semibold text-gray-900">${preview.standardRate}</span>
                </div>
                <p className="text-xs text-gray-500">Base rate × priority</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mileage Rate:</span>
                  <span className="text-lg font-semibold text-gray-900">${preview.mileageRate}</span>
                </div>
                <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Insurance Rate:</span>
                  <span className="text-lg font-semibold text-gray-900">${preview.insuranceRate}</span>
                </div>
                <p className="text-xs text-gray-500">Insurance rate × mileage</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSettings({
                    baseRates: { BLS: 150, ALS: 250, CCT: 400 },
                    perMileRates: { BLS: 2.5, ALS: 3.75, CCT: 5.0 },
                    priorityMultipliers: { LOW: 1.0, MEDIUM: 1.1, HIGH: 1.25, URGENT: 1.5 },
                    specialRequirementsSurcharge: 50,
                    insuranceRates: { medicare: 0.85, medicaid: 0.80, private: 1.0 }
                  });
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Reset to Defaults
              </button>
              <button
                onClick={loadSavedSettings}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Reload Saved Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSettings;
