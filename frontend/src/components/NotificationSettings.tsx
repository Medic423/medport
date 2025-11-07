import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  phone: string;
  notificationTypes: {
    [key: string]: {
      email: boolean;
      sms: boolean;
    };
  };
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    phone: '',
    notificationTypes: {
      'trip_assignment': { email: true, sms: false },
      'trip_status_update': { email: true, sms: false },
      'trip_accepted': { email: true, sms: false }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [smsTestStatus, setSmsTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  // Force re-render when component mounts to ensure fresh state
  useEffect(() => {
    console.log('TCC_DEBUG: NotificationSettings component mounted with settings:', settings);
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/notifications/preferences');
      
      if (response.data.success) {
        const data = response.data.data;
        const settingsData = {
          emailNotifications: data.emailEnabled || true,
          smsNotifications: data.smsEnabled || false,
          phone: data.phone || '',
          notificationTypes: data.notificationTypes || {
            'trip_assignment': { email: true, sms: false },
            'trip_status_update': { email: true, sms: false },
            'trip_accepted': { email: true, sms: false }
          }
        };
        console.log('TCC_DEBUG: Fetched settings for user:', settingsData);
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    console.log('TCC_DEBUG: Save button clicked with settings:', settings);
    setSaving(true);
    setSaveStatus('saving');
    setMessage(null);

    try {
      console.log('TCC_DEBUG: Sending settings to API:', settings);
      
      const response = await api.put('/api/notifications/preferences', {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        phone: settings.phone,
        notificationTypes: settings.notificationTypes
      });

      console.log('TCC_DEBUG: API response status:', response.status);
      console.log('TCC_DEBUG: Settings saved successfully:', response.data);
      
      setSaveStatus('success');
      const successMessage = { type: 'success' as const, text: 'Notification settings saved successfully!' };
      console.log('TCC_DEBUG: Setting message to:', successMessage);
      setMessage(successMessage);
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        console.log('TCC_DEBUG: Clearing message after timeout');
        setMessage(null);
        setSaveStatus('idle');
      }, 3000);
    } catch (error: any) {
      console.error('TCC_DEBUG: Error saving notification settings:', error);
      setSaveStatus('error');
      const errorMessage = error.response?.data?.error || 'Failed to save settings';
      setMessage({ type: 'error', text: errorMessage });
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setMessage(null);
        setSaveStatus('idle');
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setEmailTestStatus('testing');
    setMessage(null);

    try {
      const response = await api.post('/api/notifications/test-email', {
        to: 'test@example.com',
        template: 'newTripRequest'
      });

      if (response.data.success) {
        setEmailTestStatus('success');
        setMessage({ type: 'success', text: 'Email service connection successful!' });
      } else {
        setEmailTestStatus('error');
        setMessage({ type: 'error', text: response.data.error || 'Email service connection failed' });
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error testing email connection:', error);
      setEmailTestStatus('error');
      const errorMessage = error.response?.data?.error || 'Email service connection failed';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const testSMSConnection = async () => {
    setSmsTestStatus('testing');
    setMessage(null);

    try {
      const response = await api.post('/api/notifications/test-sms', {
        to: settings.phone || '5551234567',
        message: 'Test SMS from TCC notification system'
      });

      if (response.data.success) {
        setSmsTestStatus('success');
        setMessage({ type: 'success', text: 'SMS service connection successful!' });
      } else {
        setSmsTestStatus('error');
        setMessage({ type: 'error', text: response.data.error || 'SMS service connection failed' });
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error testing SMS connection:', error);
      setSmsTestStatus('error');
      const errorMessage = error.response?.data?.error || 'SMS service connection failed';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    console.log('TCC_DEBUG: Setting change:', { key, value, currentSettings: settings });
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      console.log('TCC_DEBUG: New settings after change:', newSettings);
      return newSettings;
    });
  };

  const handleNotificationTypeChange = (type: string, channel: 'email' | 'sms', enabled: boolean) => {
    console.log('TCC_DEBUG: Notification type change:', { type, channel, enabled });
    setSettings(prev => {
      const newSettings = {
        ...prev,
        notificationTypes: {
          ...prev.notificationTypes,
          [type]: {
            ...prev.notificationTypes[type],
            [channel]: enabled
          }
        }
      };
      console.log('TCC_DEBUG: New notification types after change:', newSettings.notificationTypes);
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          </div>
          <p className="text-gray-600 mt-2">
            Configure how you receive notifications about transport requests and updates.
          </p>
        </div>

        <div className="p-6">
          {(() => {
            console.log('TCC_DEBUG: Rendering message section, message state:', message);
            console.log('TCC_DEBUG: Message truthy check:', !!message);
            if (message) {
              console.log('TCC_DEBUG: Rendering message with type:', message.type, 'text:', message.text);
              return (
                <div 
                  className={`mb-6 p-4 rounded-lg flex items-center border-2 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border-green-200 shadow-lg' 
                      : 'bg-red-50 text-red-800 border-red-200 shadow-lg'
                  }`} 
                  style={{
                    zIndex: 1000, 
                    position: 'relative',
                    minHeight: '50px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
                  )}
                  <span className="text-lg font-semibold">{message.text}</span>
                </div>
              );
            }
            return null;
          })()}

          <div className="space-y-6">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive email notifications for transport request updates
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Phone Number */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleSettingChange('phone', e.target.value)}
                placeholder="Enter your phone number (e.g., 5551234567)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                This phone number will receive SMS notifications
              </p>
            </div>

            {/* SMS Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive SMS text messages for urgent transport requests
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
              
              {/* Trip Assignment Notifications */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Trip Assignment</h4>
                    <p className="text-sm text-gray-600">Get notified when new transport requests are assigned</p>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_assignment?.email || false}
                      onChange={(e) => handleNotificationTypeChange('trip_assignment', 'email', e.target.checked)}
                      disabled={!settings.emailNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.emailNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      Email
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_assignment?.sms || false}
                      onChange={(e) => handleNotificationTypeChange('trip_assignment', 'sms', e.target.checked)}
                      disabled={!settings.smsNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.smsNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      SMS
                    </span>
                  </label>
                </div>
              </div>

              {/* Trip Status Update Notifications */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Trip Status Updates</h4>
                    <p className="text-sm text-gray-600">Get notified when transport request status changes</p>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_status_update?.email || false}
                      onChange={(e) => handleNotificationTypeChange('trip_status_update', 'email', e.target.checked)}
                      disabled={!settings.emailNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.emailNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      Email
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_status_update?.sms || false}
                      onChange={(e) => handleNotificationTypeChange('trip_status_update', 'sms', e.target.checked)}
                      disabled={!settings.smsNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.smsNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      SMS
                    </span>
                  </label>
                </div>
              </div>

              {/* Trip Accepted Notifications */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Trip Accepted</h4>
                    <p className="text-sm text-gray-600">Get notified when transport requests are accepted</p>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_accepted?.email || false}
                      onChange={(e) => handleNotificationTypeChange('trip_accepted', 'email', e.target.checked)}
                      disabled={!settings.emailNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.emailNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      Email
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationTypes.trip_accepted?.sms || false}
                      onChange={(e) => handleNotificationTypeChange('trip_accepted', 'sms', e.target.checked)}
                      disabled={!settings.smsNotifications}
                      className="mr-2"
                    />
                    <span className={`text-sm ${!settings.smsNotifications ? 'text-gray-400' : 'text-gray-700'}`}>
                      SMS
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Service Tests */}
          <div className="mt-8 space-y-4">
            {/* Email Service Test */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Service Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test the email service connection to ensure notifications are working properly.
              </p>
              <button
                onClick={testEmailConnection}
                disabled={emailTestStatus === 'testing'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  emailTestStatus === 'testing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : emailTestStatus === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : emailTestStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {emailTestStatus === 'testing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Testing...
                  </>
                ) : emailTestStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Successful
                  </>
                ) : emailTestStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Failed
                  </>
                ) : (
                  'Test Email Connection'
                )}
              </button>
            </div>

            {/* SMS Service Test */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">SMS Service Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test the SMS service connection (placeholder for future Twilio integration).
              </p>
              <button
                onClick={testSMSConnection}
                disabled={smsTestStatus === 'testing'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  smsTestStatus === 'testing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : smsTestStatus === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : smsTestStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {smsTestStatus === 'testing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Testing...
                  </>
                ) : smsTestStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Successful
                  </>
                ) : smsTestStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Failed
                  </>
                ) : (
                  'Test SMS Connection'
                )}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className={`px-6 py-2 rounded-md flex items-center transition-colors duration-200 ${
                saveStatus === 'success' 
                  ? 'bg-green-600 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : saveStatus === 'saving'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Error
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
