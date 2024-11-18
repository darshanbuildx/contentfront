import React, { useState } from 'react';
import { CheckCircle, PencilLine, Share2, Clock } from 'lucide-react';
import { ContentItem } from '../types';
import { Modal } from './Modal';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ShareModal } from './ShareModal';

interface ContentCardProps {
  item: ContentItem;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  className?: string;
  showButtons?: boolean;
  disableModal?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onViewClick?: (e: React.MouseEvent) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onApprove,
  onRequestChanges,
  className = '',
  showButtons = true,
  disableModal = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onViewClick,
}) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleRequestChanges = () => {
    if (feedback.trim()) {
      onRequestChanges(item.id, feedback);
      setFeedback('');
      setIsChangeModalOpen(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectable && onSelect) {
      onSelect(item.id);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewClick) {
      onViewClick(e);
    } else if (!disableModal) {
      setIsViewModalOpen(true);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4 transition-all duration-200 ${
          isHovered ? 'shadow-lg transform -translate-y-1' : ''
        } ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} ${className}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSelectable && (
          <div className="absolute top-4 right-4">
            <div className={`w-5 h-5 rounded-md border-2 transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {isSelected && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">#{item.id}</h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareClick}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{format(item.createdAt, 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {item.platform}
            </span>
          </div>
          {item.topic && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Topic:</span>
              <span className="text-sm text-gray-800 dark:text-gray-200">{item.topic}</span>
            </div>
          )}
        </div>

        <div 
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={handleContentClick}
        >
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap line-clamp-3">{item.content}</p>
        </div>

        {item.lastFeedback && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
              <PencilLine className="h-4 w-4 mr-2" />
              Latest Feedback:
            </h4>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
              {item.lastFeedback}
            </div>
          </div>
        )}

        {showButtons && !isSelectable && (
          <div className="flex justify-end space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsChangeModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <PencilLine className="w-4 h-4 mr-2" />
              Request Changes
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(item.id);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </button>
          </div>
        )}
      </div>

      {!onViewClick && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`${item.platform} Content - ${item.id}`}
          item={item}
        >
          <div className="space-y-4">
            {item.lastFeedback && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Latest Feedback:</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
                  {item.lastFeedback}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsChangeModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <PencilLine className="w-4 h-4 mr-2" />
                Request Changes
              </button>
              <button
                onClick={() => {
                  onApprove(item.id);
                  setIsViewModalOpen(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            </div>
          </div></Modal>
      )}

      <Modal
        isOpen={isChangeModalOpen}
        onClose={() => {
          setIsChangeModalOpen(false);
          setFeedback('');
        }}
        title="Request Changes"
        item={item}
      >
        <div className="space-y-4">
          <textarea
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe the changes needed..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsChangeModalOpen(false);
                setFeedback('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!feedback.trim()}
            >
              Submit Changes
            </button>
          </div>
        </div>
      </Modal>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={item.id}
        status={item.status}
        platform={item.platform}
        postLink={item.postLink}
      />
    </>
  );
};
