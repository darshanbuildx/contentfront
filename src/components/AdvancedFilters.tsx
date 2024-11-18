import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Platform, Status } from '../types';
import { format } from 'date-fns';

interface FilterOptions {
  platform?: Platform;
  status?: Status;
  dateRange?: {
    start: Date;
    end: Date;
  };
  topic?: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const platforms: Platform[] = ['Twitter', 'Instagram', 'LinkedIn', 'Reddit', 'Skool'];
  const statuses: Status[] = ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Published'];

  useEffect(() => {
    const active = [];
    if (localFilters.platform) active.push(`Platform: ${localFilters.platform}`);
    if (localFilters.status) active.push(`Status: ${localFilters.status}`);
    if (localFilters.topic) active.push(`Topic: ${localFilters.topic}`);
    if (localFilters.dateRange) {
      active.push(`Date: ${format(localFilters.dateRange.start, 'MMM d')} - ${format(localFilters.dateRange.end, 'MMM d')}`);
    }
    setActiveFilters(active);
  }, [localFilters]);

  const handleApplyFilters = async () => {
    setIsApplying(true);
    try {
      onFilterChange(localFilters);
      setTimeout(() => {
        setIsOpen(false);
        setIsApplying(false);
      }, 300);
    } catch (error) {
      setIsApplying(false);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsOpen(false);
  };

  const removeFilter = (type: keyof FilterOptions) => {
    const updatedFilters = { ...localFilters };
    delete updatedFilters[type];
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
            activeFilters.length > 0
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className={`h-4 w-4 mr-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          {activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Filters'}
        </button>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fadeIn">
            {localFilters.platform && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-900/50">
                Platform: {localFilters.platform}
                <button
                  onClick={() => removeFilter('platform')}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <X className="h-4 w-4 hover:rotate-90 transition-transform duration-200" />
                </button>
              </span>
            )}
            {localFilters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 transition-all duration-200 hover:bg-purple-200 dark:hover:bg-purple-900/50">
                Status: {localFilters.status}
                <button
                  onClick={() => removeFilter('status')}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                  <X className="h-4 w-4 hover:rotate-90 transition-transform duration-200" />
                </button>
              </span>
            )}
            {localFilters.topic && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 transition-all duration-200 hover:bg-green-200 dark:hover:bg-green-900/50">
                Topic: {localFilters.topic}
                <button
                  onClick={() => removeFilter('topic')}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                >
                  <X className="h-4 w-4 hover:rotate-90 transition-transform duration-200" />
                </button>
              </span>
            )}
            {localFilters.dateRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 transition-all duration-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
                Date: {format(localFilters.dateRange.start, 'MMM d')} - {format(localFilters.dateRange.end, 'MMM d')}
                <button
                  onClick={() => removeFilter('dateRange')}
                  className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                >
                  <X className="h-4 w-4 hover:rotate-90 transition-transform duration-200" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slideIn">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  value={localFilters.platform || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, platform: e.target.value as Platform || undefined })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
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
                  value={localFilters.status || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as Status || undefined })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
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
                  value={localFilters.topic || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, topic: e.target.value || undefined })}
                  placeholder="Filter by topic..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={localFilters.dateRange?.start ? format(localFilters.dateRange.start, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setLocalFilters({
                          ...localFilters,
                          dateRange: date ? {
                            start: date,
                            end: localFilters.dateRange?.end || date
                          } : undefined
                        });
                      }}
                      className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={localFilters.dateRange?.end ? format(localFilters.dateRange.end, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setLocalFilters({
                          ...localFilters,
                          dateRange: date ? {
                            start: localFilters.dateRange?.start || date,
                            end: date
                          } : undefined
                        });
                      }}
                      className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  disabled={isApplying}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isApplying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Applying...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};