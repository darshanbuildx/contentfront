import React from 'react';

export const LoadingPlaceholder: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
      
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
};