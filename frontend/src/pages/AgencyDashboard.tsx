import React from 'react';
import AgencyDashboardComponent from '../components/AgencyDashboard';

interface AgencyDashboardPageProps {
  onNavigate: (page: string) => void;
}

const AgencyDashboardPage: React.FC<AgencyDashboardPageProps> = ({ onNavigate }) => {
  return <AgencyDashboardComponent onNavigate={onNavigate} />;
};

export default AgencyDashboardPage;
