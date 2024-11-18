import React, { useState, useEffect } from 'react';
import { Save, X, RefreshCw, AlertTriangle, Download, Upload, Eye, EyeOff, Copy, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkSheetConnection } from '../services/sheets';

interface ColumnMapping {
  appField: string;
  sheetColumn: string;
  required?: boolean;
  description?: string;
}

interface SheetConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mappings: ColumnMapping[]) => Promise<void>;
}

export const SheetConfig: React.FC<SheetConfigProps> = ({ isOpen, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([
    { appField: 'id', sheetColumn: '', required: true, description: 'Unique identifier for each content item' },
    { appField: 'platform', sheetColumn: '', required: true, description: 'Social media platform' },
    { appField: 'topic', sheetColumn: '', required: true, description: 'Content topic or category' },
    { appField: 'content', sheetColumn: '', required: true, description: 'The actual content text' },
    { appField: 'status', sheetColumn: '', required: true, description: 'Current content status' },
    { appField: 'createdAt', sheetColumn: '', required: true, description: 'Creation date and time' },
    { appField: 'lastFeedback', sheetColumn: '', description: 'Most recent feedback' },
    { appField: 'lastFeedbackDate', sheetColumn: '', description: 'Date of last feedback' },
    { appField: 'dateApproved', sheetColumn: '', description: 'Approval date' },
    { appField: 'approvedBy', sheetColumn: '', description: 'User who approved' },
    { appField: 'postScheduledDate', sheetColumn: '', description: 'Scheduled publish date' },
    { appField: 'postLink', sheetColumn: '', description: 'Link to published content' }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadSheetStructure();
    }
  }, [isOpen]);

  const loadSheetStructure = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await checkSheetConnection();
      
      if (!status.connected) {
        throw new Error('Sheet connection failed');
      }

      if (!status.columns?.length) {
        throw new Error('No columns found in sheet');
      }

      // Filter out any empty columns or system columns
      const validColumns = status.columns.filter(col => 
        col && !['6', '1X5'].includes(col)
      );

      setSheetColumns(validColumns);

      // Auto-map columns based on name similarity
      const updatedMappings = mappings.map(mapping => {
        const matchingColumn = validColumns.find(col => {
          const colName = col.toLowerCase().replace(/[^a-z0-9]/g, '');
          const fieldName = mapping.appField.toLowerCase();
          return colName.includes(fieldName) || fieldName.includes(colName);
        });
        return {
          ...mapping,
          sheetColumn: matchingColumn || ''
        };
      });

      setMappings(updatedMappings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sheet structure');
      toast.error('Failed to load sheet structure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      const missingRequired = mappings.filter(m => m.required && !m.sheetColumn);
      if (missingRequired.length > 0) {
        throw new Error(`Missing required mappings: ${missingRequired.map(m => m.appField).join(', ')}`);
      }

      await onSave(mappings);
      toast.success('Sheet configuration saved successfully');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch preview data');
      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);
    } catch (err) {
      toast.error('Failed to load preview data');
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        return new Date(value).toLocaleString();
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sheet Configuration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Map your application fields to Google Sheet columns
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSheetStructure}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Structure
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
        </div>

        {showPreview ? (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mapping
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {previewData?.length ? (
                <div className="space-y-6">
                  {previewData.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {mappings.map(mapping => (
                          mapping.sheetColumn && (
                            <div key={mapping.appField} className="space-y-1">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {mapping.appField.charAt(0).toUpperCase() + mapping.appField.slice(1).replace(/([A-Z])/g, ' $1')}
                              </span>
                              <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                                {formatValue(item[mapping.sheetColumn])}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No preview data available
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Application Field
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sheet Column
                  </th>
                  {showAdvanced && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mappings.map(({ appField, sheetColumn, required, description }) => (
                  <tr key={appField} className="bg-white dark:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {appField}
                        {required && (
                          <span className="ml-1 text-red-500 dark:text-red-400">*</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={sheetColumn}
                        onChange={(e) => {
                          const newMappings = mappings.map(m =>
                            m.appField === appField ? { ...m, sheetColumn: e.target.value } : m
                          );
                          setMappings(newMappings);
                        }}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select column</option>
                        {sheetColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </td>
                    {showAdvanced && (
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {showPreview ? 'Refresh Preview' : 'Preview Mapping'}
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
