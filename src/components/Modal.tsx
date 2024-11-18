import React, { useEffect } from 'react';
import { X, Calendar, Hash, Globe, Tag, Copy, ZoomIn, ZoomOut, Clock } from 'lucide-react';
import { PlatformPreview } from './PlatformPreview';
import { ContentItem } from '../types';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import toast from 'react-hot-toast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  item?: ContentItem;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, item }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async () => {
    if (item) {
      await navigator.clipboard.writeText(item.content);
      toast.success('Content copied to clipboard');
    }
  };

  // Calculate content stats
  const wordCount = item?.content.trim().split(/\s+/).length || 0;
  const charCount = item?.content.length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/90 backdrop-blur-sm transition-opacity z-[99998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[99999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div 
            className="relative transform rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {item && (
                <div className="space-y-6">
                  {/* Post Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ID:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{item.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{item.platform}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{item.topic}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Content Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-4">
                    <div className="flex items-center space-x-4">
                      <span>{wordCount} words</span>
                      <span>{charCount} characters</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {readTime} min read
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy content"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title={isZoomed ? "Zoom out" : "Zoom in"}
                      >
                        {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Platform Preview */}
                  <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200 ${
                    isZoomed ? 'transform scale-105' : ''
                  }`}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Preview</h4>
                    <PlatformPreview
                      platform={item.platform}
                      content={item.content}
                      author="Hamza"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {children}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};