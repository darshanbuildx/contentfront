import React, { useState, useCallback, useEffect } from 'react';
import { ContentItem } from '../types';
import { ContentList } from './ContentList';
import { Analytics } from './Analytics';
import { Modal } from './Modal';
import { BarChart2, Calendar, Clock, AlertCircle, Settings } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { AdvancedFilters } from './AdvancedFilters';
import { ExportMenu } from './ExportMenu';
import { SheetConfig } from './SheetConfig';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';

interface DashboardProps {
  searchQuery: string;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onUpdateStatus: (id: string, status: ContentItem['status']) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  searchQuery,
  onApprove,
  onRequestChanges,
  onUpdateStatus
}) => {
  const [filters, setFilters] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);

  const { loadContent, isLoading, error } = useApi();

  const loadData = useCallback(async () => {
    try {
      const data = await loadContent();
      setItems(data);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load content');
    }
  }, [loadContent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleSaveSheetConfig = async (mappings: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Sheet configuration updated successfully');
      await loadData(); // Reload data after config update
    } catch (error) {
      console.error('Failed to save sheet config:', error);
      throw error;
    }
  };

  // Filter items based on filters and search
  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${item.content} ${item.topic} ${item.platform}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.topic && !item.topic.toLowerCase().includes(filters.topic.toLowerCase())) return false;
    if (filters.dateRange) {
      const itemDate = new Date(item.createdAt);
      if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
    }
    return true;
  });

  const needsAttentionItems = filteredItems.filter(
    item => item.status === 'Draft' || item.status === 'Changes Requested'
  );

  const inReviewItems = filteredItems.filter(
    item => item.status === 'In Review'
  );

  const approvedItems = filteredItems.filter(
    item => item.status === 'Approved' || item.status === 'Published'
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Needs Attention</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{needsAttentionItems.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 flex items-center space-x-4">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Review</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inReviewItems.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{approvedItems.length}</p>
          </div>
        </div>
      </div>

      {/* Analytics Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-5 w-5" />
            <span className="font-medium">Analytics Overview</span>
          </div>
          {showAnalytics ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        
        {showAnalytics && (
          <div className="mt-4">
            <Analytics items={items} />
          </div>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />
          <ConnectionStatus />
          <button
            onClick={() => setIsSheetConfigOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            Sheet Config
          </button>
          <ExportMenu items={filteredItems} />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Content Sections */}
      {!isLoading && (
        <>
          {needsAttentionItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                Needs Your Attention ({needsAttentionItems.length})
              </h2>
              <ContentList
                items={needsAttentionItems}
                onApprove={onApprove}
                onRequestChanges={onRequestChanges}
                onUpdateStatus={onUpdateStatus}
              />
            </section>
          )}

          {inReviewItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                In Review ({inReviewItems.length})
              </h2>
              <ContentList
                items={inReviewItems}
                onApprove={onApprove}
                onRequestChanges={onRequestChanges}
                onUpdateStatus={onUpdateStatus}
              />
            </section>
          )}

          {approvedItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                Approved ({approvedItems.length})
              </h2>
              <ContentList
                items={approvedItems}
                onApprove={onApprove}
                onRequestChanges={onRequestChanges}
                onUpdateStatus={onUpdateStatus}
              />
            </section>
          )}
        </>
      )}

      {/* Sheet Configuration Modal */}
      <SheetConfig
        isOpen={isSheetConfigOpen}
        onClose={() => setIsSheetConfigOpen(false)}
        onSave={handleSaveSheetConfig}
      />

      {/* View Modal */}
      {selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          title={`${selectedItem.platform} Content - ${selectedItem.id}`}
          item={selectedItem}
        >
          <div className="space-y-4">
            {selectedItem.lastFeedback && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Latest Feedback:</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
                  {selectedItem.lastFeedback}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  onRequestChanges(selectedItem.id, '');
                  setIsViewModalOpen(false);
                  setSelectedItem(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Request Changes
              </button>
              <button
                onClick={() => {
                  onApprove(selectedItem.id);
                  setIsViewModalOpen(false);
                  setSelectedItem(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
