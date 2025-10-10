import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Users, 
  BarChart3, 
  Send, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Clock
} from 'lucide-react';
import api from '../services/api';

interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  totalCost: number;
  byCarrier: { [carrier: string]: { sent: number; delivered: number; failed: number; cost: number } };
}

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  phone: string | null;
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: string;
}

interface Carrier {
  name: string;
  gateway: string;
  costPerMessage: number;
  reliability: number;
  maxLength: number;
}

const AdminNotificationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'broadcast' | 'templates' | 'logs'>('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Overview data
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{ email: boolean; sms: boolean } | null>(null);
  
  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  
  // Broadcast data
  const [broadcastData, setBroadcastData] = useState({
    notificationType: 'trip_assignment',
    message: '',
    userTypes: ['ADMIN', 'USER', 'HEALTHCARE', 'EMS'],
    emailData: { subject: '', body: '' },
    smsData: { message: '' }
  });
  
  // Templates data
  const [templates, setTemplates] = useState<any>(null);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  
  // Logs data
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilters, setLogFilters] = useState({
    days: 30,
    userId: '',
    channel: '',
    status: ''
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [statsResponse, statusResponse] = await Promise.all([
        api.get('/api/admin/notifications/stats'),
        api.get('/api/notifications/status')
      ]);

      if (statsResponse.data.success) {
        // Ensure all required properties have default values
        const statsData = statsResponse.data.data || {};
        setStats({
          totalSent: statsData.totalSent || 0,
          totalDelivered: statsData.totalDelivered || 0,
          totalFailed: statsData.totalFailed || 0,
          deliveryRate: statsData.deliveryRate || 0,
          averageDeliveryTime: statsData.averageDeliveryTime || 0,
          totalCost: statsData.totalCost || 0,
          byCarrier: statsData.byCarrier || {}
        });
      }

      if (statusResponse.data.success) {
        setServiceStatus({
          email: statusResponse.data.data.email.working,
          sms: statusResponse.data.data.sms.working
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setMessage({ type: 'error', text: 'Failed to load overview data' });
      // Set default stats on error
      setStats({
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        averageDeliveryTime: 0,
        totalCost: 0,
        byCarrier: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/notifications/users', {
        params: { userType: selectedUserType || undefined }
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [templatesResponse, carriersResponse] = await Promise.all([
        api.get('/api/admin/notifications/templates'),
        api.get('/api/admin/notifications/carriers')
      ]);

      if (templatesResponse.data.success) {
        setTemplates(templatesResponse.data.data);
      }

      if (carriersResponse.data.success) {
        setCarriers(carriersResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage({ type: 'error', text: 'Failed to load templates' });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/notifications/logs', {
        params: logFilters
      });

      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setMessage({ type: 'error', text: 'Failed to load logs' });
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/notifications/broadcast', broadcastData);

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Broadcast sent to ${response.data.data.successful} users successfully` 
        });
        setBroadcastData({
          notificationType: 'trip_assignment',
          message: '',
          userTypes: ['ADMIN', 'USER', 'HEALTHCARE', 'EMS'],
          emailData: { subject: '', body: '' },
          smsData: { message: '' }
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to send broadcast' });
      }
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to send broadcast' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testSystem = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/notifications/test-system');

      if (response.data.success) {
        setMessage({ type: 'success', text: 'System test completed successfully' });
      } else {
        setMessage({ type: 'error', text: 'System test failed' });
      }
    } catch (error: any) {
      console.error('Error testing system:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'System test failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Email Service</h3>
              <p className={`text-sm ${serviceStatus?.email ? 'text-green-600' : 'text-red-600'}`}>
                {serviceStatus?.email ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">SMS Service</h3>
              <p className={`text-sm ${serviceStatus?.sms ? 'text-green-600' : 'text-red-600'}`}>
                {serviceStatus?.sms ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Total Sent</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSent || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Delivered</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalDelivered || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Failed</h3>
                <p className="text-2xl font-bold text-red-600">{stats.totalFailed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Delivery Rate</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.deliveryRate ? stats.deliveryRate.toFixed(1) : '0.0'}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost Information */}
      {stats ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCost || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Delivery Time</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageDeliveryTime ? stats.averageDeliveryTime.toFixed(0) : '0'}ms</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Test */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Test</h3>
        <p className="text-gray-600 mb-4">Test the notification system to ensure everything is working correctly.</p>
        <button
          onClick={testSystem}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test System'}
        </button>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Filters</h3>
        <div className="flex space-x-4">
          <select
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All User Types</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="HEALTHCARE">Healthcare</option>
            <option value="EMS">EMS</option>
          </select>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Notifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMS Notifications</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.emailNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.smsNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Send Broadcast Notification</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
            <select
              value={broadcastData.notificationType}
              onChange={(e) => setBroadcastData(prev => ({ ...prev, notificationType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="trip_assignment">Trip Assignment</option>
              <option value="trip_status_update">Trip Status Update</option>
              <option value="trip_accepted">Trip Accepted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target User Types</label>
            <div className="space-y-2">
              {['ADMIN', 'USER', 'HEALTHCARE', 'EMS'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={broadcastData.userTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBroadcastData(prev => ({
                          ...prev,
                          userTypes: [...prev.userTypes, type]
                        }));
                      } else {
                        setBroadcastData(prev => ({
                          ...prev,
                          userTypes: prev.userTypes.filter(t => t !== type)
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
            <input
              type="text"
              value={broadcastData.emailData.subject}
              onChange={(e) => setBroadcastData(prev => ({
                ...prev,
                emailData: { ...prev.emailData, subject: e.target.value }
              }))}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
            <textarea
              value={broadcastData.emailData.body}
              onChange={(e) => setBroadcastData(prev => ({
                ...prev,
                emailData: { ...prev.emailData, body: e.target.value }
              }))}
              placeholder="Enter email body"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMS Message</label>
            <textarea
              value={broadcastData.smsData.message}
              onChange={(e) => setBroadcastData(prev => ({
                ...prev,
                smsData: { ...prev.smsData, message: e.target.value }
              }))}
              placeholder="Enter SMS message"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={sendBroadcast}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Email Templates */}
      {templates?.email && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
          <div className="space-y-4">
            {Object.entries(templates.email).map(([key, template]: [string, any]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <p className="text-sm text-blue-600">Subject: {template.subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS Templates */}
      {templates?.sms && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">SMS Templates</h3>
          <div className="space-y-4">
            {Object.entries(templates.sms).map(([key, template]: [string, any]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <p className="text-sm text-green-600">Max Length: {template.maxLength} characters</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carriers */}
      {carriers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">SMS Carriers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carriers.map((carrier, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{carrier.name}</h4>
                <p className="text-sm text-gray-600 mb-2">Gateway: {carrier.gateway}</p>
                <p className="text-sm text-blue-600">Cost: {formatCurrency(carrier.costPerMessage)} per message</p>
                <p className="text-sm text-green-600">Reliability: {(carrier.reliability * 100).toFixed(1)}%</p>
                <p className="text-sm text-purple-600">Max Length: {carrier.maxLength} characters</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Log Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
            <select
              value={logFilters.days}
              onChange={(e) => setLogFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
            <select
              value={logFilters.channel}
              onChange={(e) => setLogFilters(prev => ({ ...prev, channel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={logFilters.status}
              onChange={(e) => setLogFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchLogs}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Notification Logs ({logs.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user?.name || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.notificationType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.sentAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.deliveredAt ? formatDate(log.deliveredAt) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Admin Notification Management</h2>
          </div>
          <p className="text-gray-600 mt-2">
            Manage notification settings, send broadcasts, and monitor system performance.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'broadcast', label: 'Broadcast', icon: Send },
              { id: 'templates', label: 'Templates', icon: Settings },
              { id: 'logs', label: 'Logs', icon: Clock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'broadcast' && renderBroadcast()}
              {activeTab === 'templates' && renderTemplates()}
              {activeTab === 'logs' && renderLogs()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationManagement;

