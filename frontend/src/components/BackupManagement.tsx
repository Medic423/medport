import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Plus, 
  HardDrive, 
  Calendar, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { formatFileSize } from '../utils/numberUtils';

interface BackupFile {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load backup history on component mount
  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/backup/history');
      
      if (response.data.success) {
        setBackups(response.data.data);
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to load backup history' });
      }
    } catch (error) {
      console.error('Error loading backup history:', error);
      setMessage({ type: 'error', text: 'Failed to load backup history' });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      setMessage(null);
      
      const response = await api.post('/api/backup/create');
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Backup created successfully!' });
        loadBackupHistory(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to create backup' });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setMessage({ type: 'error', text: 'Failed to create backup' });
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const response = await api.get(`/api/backup/download/${filename}`, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setMessage({ type: 'error', text: 'Failed to download backup' });
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      setMessage({ type: 'error', text: 'Failed to download backup' });
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/backup/${filename}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Backup deleted successfully!' });
        loadBackupHistory(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to delete backup' });
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      setMessage({ type: 'error', text: 'Failed to delete backup' });
    }
  };


  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup Management</h1>
          <p className="text-gray-600">
            Create, download, and manage database backups for data protection and compliance.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={createBackup}
              disabled={creating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {creating ? 'Creating Backup...' : 'Create New Backup'}
            </button>
            
            <button
              onClick={loadBackupHistory}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Refresh List
            </button>
          </div>
        </div>

        {/* Backup List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Backup History</h2>
            <p className="text-sm text-gray-500">
              {backups.length} backup{backups.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 animate-spin mb-2" />
              <p className="text-gray-500">Loading backup history...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
              <p className="text-gray-500 mb-4">Create your first backup to get started.</p>
              <button
                onClick={createBackup}
                disabled={creating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.filename} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(backup.created)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(backup.modified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => downloadBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Download backup"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.filename)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete backup"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* External Drive Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <HardDrive className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">External Drive Backup</h3>
              <p className="text-sm text-blue-700 mt-1">
                Database backups are stored in <code className="bg-blue-100 px-1 rounded">database-backups/</code> and automatically copied to <code className="bg-blue-100 px-1 rounded">/Volumes/Acasis/tcc-database-backups/</code> 
                when the external drive is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManagement;
