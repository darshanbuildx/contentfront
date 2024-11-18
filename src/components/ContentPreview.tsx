import React, { useState } from 'react';
import { Copy, ZoomIn, ZoomOut, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContentPreviewProps {
  content: string;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ content }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const wordCount = content.trim().split(/\s+/).length;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div 
        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all duration-200 ${
          isZoomed ? 'text-lg' : 'text-base'
        }`}
      >
        {content}
      </div>
    </div>
  );
};