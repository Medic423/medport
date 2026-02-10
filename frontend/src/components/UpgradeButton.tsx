import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface UpgradeButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className = '',
  onClick,
  children
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = '/pricing';
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <Sparkles className={`${iconSize[size]} mr-2`} />}
      {children || 'Upgrade to Paid Plan'}
      {showIcon && <ArrowRight className={`${iconSize[size]} ml-2`} />}
    </button>
  );
};

export default UpgradeButton;
