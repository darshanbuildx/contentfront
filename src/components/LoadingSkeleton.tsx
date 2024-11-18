import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};