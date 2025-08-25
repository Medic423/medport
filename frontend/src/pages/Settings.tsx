import React from 'react';
import Settings from '../components/Settings';

const SettingsPage: React.FC = () => {
  const handleNavigate = (page: string) => {
    // This will be handled by the parent App component
    console.log('Navigate to:', page);
  };

  return <Settings onNavigate={handleNavigate} />;
};

export default SettingsPage;
