import React from 'react';
import { Tooltip } from './Tooltip';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltipContent?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  tooltipContent,
}) => {
  const baseClasses = "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover-lift";
  
  const variantClasses = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
  };

  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return tooltipContent ? (
    <Tooltip content={tooltipContent}>{button}</Tooltip>
  ) : button;
};