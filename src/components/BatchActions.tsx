import React from 'react';
import { CheckCircle, XCircle, Trash2, X } from 'lucide-react';
import { Status } from '../types';
import { Tooltip } from './Tooltip';

interface BatchActionsProps {
  selectedIds: string[];
  onApproveAll: () => void;
  onRejectAll: () => void;
  onClearSelection: () => void;
  currentStatus: Status;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedIds,
  onApproveAll,
  onRejectAll,
  onClearSelection,
  currentStatus,
}) => {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{selectedIds.length}</span>
        <span>items selected</span>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center space-x-2">
        {currentStatus !== 'Approved' && (
          <Tooltip content="Approve selected items">
            <button
              onClick={onApproveAll}
              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        {currentStatus !== 'Changes Requested' && (
          <Tooltip content="Request changes for selected items">
            <button
              onClick={onRejectAll}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip content="Clear selection">
          <button
            onClick={onClearSelection}
            className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};