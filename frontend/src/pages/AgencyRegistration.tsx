import React from 'react';
import AgencyRegistrationComponent from '../components/AgencyRegistration';

interface AgencyRegistrationPageProps {
  onNavigate: (page: string) => void;
}

const AgencyRegistrationPage: React.FC<AgencyRegistrationPageProps> = ({ onNavigate }) => {
  return <AgencyRegistrationComponent onNavigate={onNavigate} />;
};

export default AgencyRegistrationPage;
