import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Search } from 'lucide-react';
import HelpViewer from './HelpViewer';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'HEALTHCARE' | 'EMS' | 'ADMIN';
  topic?: string; // Current page/topic (e.g., 'create-request', 'transport-requests')
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, userType, topic }) => {
  const [helpContent, setHelpContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(topic);

  // Map user types to directory names
  const userTypeDir: Record<string, string> = {
    HEALTHCARE: 'healthcare',
    EMS: 'ems',
    ADMIN: 'tcc-admin',
  };

  // Map topics to file names (default to index if not provided)
  const getHelpFileName = (topic?: string): string => {
    if (!topic || topic === 'index') return 'index';
    
    // Handle different naming conventions
    // If topic starts with 'helpfile', use it as-is, otherwise map it
    if (topic.startsWith('helpfile')) {
      return topic;
    }
    
    // Map common topic names to file names
    // Supports both 'helpfile01_' prefix and standard names
    const topicMap: Record<string, string> = {
      // Healthcare topics
      'create': 'helpfile01_create-request',
      'create-request': 'helpfile01_create-request',
      'helpfile01_create-request': 'helpfile01_create-request',
      'trips': 'transport-requests',
      'transport-requests': 'transport-requests',
      'in-progress': 'in-progress',
      'completed': 'completed-trips',
      'completed-trips': 'completed-trips',
      'hospital-settings': 'hospital-settings',
      'ems-providers': 'ems-providers',
      'destinations': 'destinations',
      'users': 'team-members',
      'team-members': 'team-members',
      // EMS topics
      'available-trips': 'helpfile01_available_trips',
      'my-trips': 'helpfile02_my_trips',
      'completed-trips': 'helpfile03_completed_trips copy',
      'units': 'helpfile04_units',
      'agency-info': 'helpfile06_agency',
      'trip-calculator': 'helpfile07_trip_calculator',
    };
    
    // If topic already starts with 'helpfile', use it as-is
    if (topic.startsWith('helpfile')) {
      return topic;
    }
    
    // Handle userType-specific mappings
    // For EMS, 'users' maps to helpfile05_users, for Healthcare it maps to team-members
    if (topic === 'users' && userType === 'EMS') {
      return 'helpfile05_users';
    }
    
    return topicMap[topic] || topic;
  };

  // Update currentTopic when topic prop changes
  useEffect(() => {
    setCurrentTopic(topic);
  }, [topic]);

  // Load help content when modal opens or topic changes
  useEffect(() => {
    if (!isOpen) return;

    const loadHelpContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const dir = userTypeDir[userType] || 'healthcare';
        const fileName = getHelpFileName(currentTopic);
        
        // Load from public/help/ directory (served as static assets)
        const filePath = `/help/${dir}/${fileName}.md`;
        
        console.log('Loading help file:', filePath);
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
          // Try index.md as fallback
          if (fileName !== 'index') {
            console.log('File not found, trying index.md');
            const indexPath = `/help/${dir}/index.md`;
            const indexResponse = await fetch(indexPath);
            if (indexResponse.ok) {
              const text = await indexResponse.text();
              setHelpContent(text);
              setLoading(false);
              return;
            }
          }
          throw new Error(`Help file not found: ${filePath} (Status: ${response.status})`);
        }
        
        const text = await response.text();
        setHelpContent(text);
      } catch (err) {
        console.error('Error loading help content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load help content');
        setHelpContent(`# Help Content Not Available\n\nSorry, the help content for this topic could not be loaded.\n\n**Topic:** ${topic || 'index'}\n\nPlease contact your system administrator for assistance.`);
      } finally {
        setLoading(false);
      }
    };

    loadHelpContent();
  }, [isOpen, userType, currentTopic]);

  // Handle topic change from internal links
  const handleTopicChange = (newTopic: string) => {
    console.log('HelpModal: Topic changed to:', newTopic);
    setCurrentTopic(newTopic);
    setSearchQuery(''); // Clear search when navigating to new topic
  };

  // Handle search (simple text search within content)
  const filteredContent = searchQuery
    ? helpContent
        .split('\n')
        .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
        .join('\n')
    : helpContent;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Help & Documentation
              </h2>
              {currentTopic && currentTopic !== 'index' && (
                <span className="text-sm text-gray-500">
                  ({currentTopic.replace(/-/g, ' ').replace(/helpfile\d+_/g, '')})
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close help"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar (Optional) */}
          {helpContent && (
            <div className="px-6 py-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading help content...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error loading help content</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            ) : (
              <HelpViewer content={filteredContent} onTopicChange={handleTopicChange} userType={userType} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Need more help? Contact your system administrator.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

