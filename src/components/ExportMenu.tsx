import React, { useState } from 'react';
import { Download, Table, FileText } from 'lucide-react';
import { ContentItem } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { exportToPDF } from '../utils/pdfExport';

interface ExportMenuProps {
  items: ContentItem[];
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportToExcel = () => {
    exportToExcel(items);
    setIsOpen(false);
  };

  const handleExportToPDF = () => {
    exportToPDF(items);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slideIn">
            <div className="p-1">
              <button
                onClick={handleExportToExcel}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Table className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                Export to Excel
              </button>
              <button
                onClick={handleExportToPDF}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                Export to PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};