import React, { useState } from 'react';
import { Platform, Status } from '../types';
import { X, Filter as FilterIcon } from 'lucide-react';
import { format } from 'date-fns';

interface FilterPanelProps {
  onClose: () => void;
  onFilterChange: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onFilterChange }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [status, setStatus] = useState<Status | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const platforms: Platform[] = ['Twitter', 'Instagram', 'LinkedIn', 'Reddit', 'Skool'];
  const statuses: Status[] = ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Published'];

  const handleApplyFilters = () => {
    const filters = {
      topic: topic || undefined,
      platform: platform || undefined,
      status: status || undefined,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    };
    onFilterChange(filters);
    onClose();
  };

  const handleClearAll = () => {
    setTopic('');
    setPlatform('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
    onClose();
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FilterIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Filter by topic..."
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};