import React from 'react';
import AgencyLoginComponent from '../components/AgencyLogin';

interface AgencyLoginPageProps {
  onNavigate: (page: string) => void;
}

const AgencyLoginPage: React.FC<AgencyLoginPageProps> = ({ onNavigate }) => {
  return <AgencyLoginComponent onNavigate={onNavigate} />;
};

export default AgencyLoginPage;
