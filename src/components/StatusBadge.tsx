import React from 'react';
import { Status } from '../types';
import { CheckCircle, Clock, AlertTriangle, FileEdit, Rocket } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  'Draft': {
    icon: FileEdit,
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-800 dark:text-blue-200',
    iconClass: 'text-blue-600 dark:text-blue-400',
    tooltip: 'Content is in draft state'
  },
  'In Review': {
    icon: Clock,
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    tooltip: 'Pending review'
  },
  'Changes Requested': {
    icon: AlertTriangle,
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-800 dark:text-red-200',
    iconClass: 'text-red-600 dark:text-red-400',
    tooltip: 'Changes have been requested'
  },
  'Approved': {
    icon: CheckCircle,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-200',
    iconClass: 'text-green-600 dark:text-green-400',
    tooltip: 'Content has been approved'
  },
  'Published': {
    icon: Rocket,
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-800 dark:text-purple-200',
    iconClass: 'text-purple-600 dark:text-purple-400',
    tooltip: 'Content is live'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Tooltip content={config.tooltip}>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} transition-all duration-200 hover:scale-105`}>
        <Icon className={`w-3.5 h-3.5 mr-1 ${config.iconClass}`} />
        {status}
      </span>
    </Tooltip>
  );
};