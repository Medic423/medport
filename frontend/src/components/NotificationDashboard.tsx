import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Settings,
  TestTube,
  Info
} from 'lucide-react';

interface NotificationStatus {
  twilio: boolean;
  sms: boolean;
  email: boolean;
  push: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  content: string;
  variables: string[];
  isActive: boolean;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'undelivered';
}

const NotificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceStatus, setServiceStatus] = useState<NotificationStatus | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [testResults, setTestResults] = useState<NotificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+15551234567');

  // Test notification forms
  const [smsForm, setSmsForm] = useState({
    to: '+15551234567',
    message: 'Test SMS message from MedPort',
    priority: 'normal' as const,
    template: '',
  });

  const [emailForm, setEmailForm] = useState({
    to: 'test@example.com',
    subject: 'Test Email from MedPort',
    body: 'This is a test email message from the MedPort notification system.',
    template: '',
  });

  const [urgentTransportForm, setUrgentTransportForm] = useState({
    phoneNumber: '+15551234567',
    facilityName: 'UPMC Altoona',
    transportLevel: 'CCT',
    priority: 'Critical',
  });

  useEffect(() => {
    loadServiceStatus();
    loadTemplates();
  }, []);

  const loadServiceStatus = async () => {
    try {
      const response = await fetch('/api/notifications/status', {
        headers: {
          'Authorization': 'Bearer demo-token',
        },
      });
      const data = await response.json();
      if (data.success) {
        setServiceStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications/templates', {
        headers: {
          'Authorization': 'Bearer demo-token',
        },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const sendTestNotification = async (type: 'sms' | 'email' | 'push' | 'urgent-transport') => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload: any = {};

      switch (type) {
        case 'sms':
          endpoint = '/api/notifications/sms';
          payload = smsForm;
          break;
        case 'email':
          endpoint = '/api/notifications/email';
          payload = emailForm;
          break;
        case 'urgent-transport':
          endpoint = '/api/notifications/urgent-transport';
          payload = urgentTransportForm;
          break;
        default:
          endpoint = '/api/notifications/test';
          payload = { phoneNumber: testPhoneNumber };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        const result: NotificationResult = {
          success: true,
          messageId: data.data.messageId,
          timestamp: new Date().toLocaleString(),
          deliveryStatus: data.data.deliveryStatus,
        };
        setTestResults(prev => [result, ...prev]);
      } else {
        const result: NotificationResult = {
          success: false,
          error: data.error,
          timestamp: new Date().toLocaleString(),
          deliveryStatus: 'failed',
        };
        setTestResults(prev => [result, ...prev]);
      }
    } catch (error) {
      const result: NotificationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString(),
        deliveryStatus: 'failed',
      };
      setTestResults(prev => [result, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Notification Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage automated communications for transport requests, status updates, and agency notifications
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Bell },
                { id: 'sms', label: 'SMS Testing', icon: MessageSquare },
                { id: 'email', label: 'Email Testing', icon: Mail },
                { id: 'urgent', label: 'Urgent Transport', icon: AlertCircle },
                { id: 'templates', label: 'Templates', icon: Settings },
                { id: 'test', label: 'Test System', icon: TestTube },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Service Status</h2>
              
              {serviceStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Twilio Service</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {serviceStatus.twilio ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      {getStatusIcon(serviceStatus.twilio)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">SMS Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {serviceStatus.sms ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                      {getStatusIcon(serviceStatus.sms)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {serviceStatus.email ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                      {getStatusIcon(serviceStatus.email)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Push Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {serviceStatus.push ? 'Available' : 'Coming Soon'}
                        </p>
                      </div>
                      {getStatusIcon(serviceStatus.push)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Demo Mode Active
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Twilio integration is running in demo mode. All notifications will be logged to the console
                        instead of being sent. To enable real notifications, configure your Twilio credentials in the
                        environment variables.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SMS Testing Tab */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">SMS Notification Testing</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={smsForm.to}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+15551234567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={smsForm.message}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your SMS message..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={smsForm.priority}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => sendTestNotification('sms')}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Test SMS'}
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">SMS Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Character limit: 1600 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Priority levels: Low, Normal, High, Urgent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Template support with variables
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Delivery status tracking
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Email Testing Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Email Notification Testing</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="test@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Body
                    </label>
                    <textarea
                      value={emailForm.body}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email message..."
                    />
                  </div>
                  
                  <button
                    onClick={() => sendTestNotification('email')}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Email Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      HTML and plain text support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Template system with variables
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Attachment support (coming soon)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Delivery tracking and analytics
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Urgent Transport Tab */}
          {activeTab === 'urgent' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Urgent Transport Notifications</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={urgentTransportForm.phoneNumber}
                      onChange={(e) => setUrgentTransportForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+15551234567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      value={urgentTransportForm.facilityName}
                      onChange={(e) => setUrgentTransportForm(prev => ({ ...prev, facilityName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="UPMC Altoona"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transport Level
                      </label>
                      <select
                        value={urgentTransportForm.transportLevel}
                        onChange={(e) => setUrgentTransportForm(prev => ({ ...prev, transportLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BLS">BLS</option>
                        <option value="ALS">ALS</option>
                        <option value="CCT">CCT</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={urgentTransportForm.priority}
                        onChange={(e) => setUrgentTransportForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendTestNotification('urgent-transport')}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Urgent Transport Alert'}
                  </button>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-900 mb-3">Urgent Transport Features</h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-500" />
                      High-priority SMS notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-500" />
                      Automatic escalation system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-500" />
                      Facility and transport level details
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-red-500" />
                      Immediate response tracking
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Notification Templates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.type === 'sms' ? 'bg-blue-100 text-blue-800' :
                          template.type === 'email' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {template.type.toUpperCase()}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        template.isActive ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Content:</p>
                      <div className="bg-white p-3 rounded border text-sm font-mono text-gray-700 whitespace-pre-wrap">
                        {template.content}
                      </div>
                    </div>
                    
                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {`{${variable}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test System Tab */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Test Notification System</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Phone Number
                    </label>
                    <input
                      type="tel"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+15551234567"
                    />
                  </div>
                  
                  <button
                    onClick={() => sendTestNotification('test')}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    {loading ? 'Testing...' : 'Send Test Notification'}
                  </button>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">Test Mode</h3>
                    <p className="text-sm text-yellow-700">
                      This will send a test notification to verify the system is working correctly.
                      In demo mode, notifications are logged to the console instead of being sent.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No test results yet. Send a test notification to see results here.</p>
                    ) : (
                      testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.success
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                result.success ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {result.success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{result.timestamp}</span>
                          </div>
                          
                          {result.messageId && (
                            <p className="text-xs text-gray-600 mb-1">
                              ID: {result.messageId}
                            </p>
                          )}
                          
                          {result.error && (
                            <p className="text-sm text-red-700">{result.error}</p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              result.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              result.deliveryStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              result.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {result.deliveryStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDashboard;
