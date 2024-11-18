import React, { useState, useEffect } from 'react';
import { X, Copy, Share2, MessageCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { ContentItem, Platform } from '../types';
import { apiService } from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  status: string;
  platform: Platform;
  postLink?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  postId, 
  status,
  platform,
  postLink 
}) => {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/post/${postId}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.custom((t) => (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <Copy className="w-5 h-5" />
          <span>Link copied to clipboard!</span>
        </div>
      ), {
        position: 'top-center',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.custom((t) => (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <X className="w-5 h-5" />
          <span>Failed to copy link</span>
        </div>
      ), {
        position: 'top-center',
        duration: 2000,
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this ${platform} content (${postId}): ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${platform} Content #${postId}`,
          text: content?.content || `Check out this content (${postId})`,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Failed to share content');
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[45]"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-[46] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Content
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Post ID:</span> {postId}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Platform:</span> {platform}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Status:</span> {status}
            </div>
            {postLink && status === 'Published' && (
              <a
                href={postLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Live Post
              </a>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full pr-24 pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={handleCopy}
              className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
            )}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Share via WhatsApp
            </button>
          </div>

          {status !== 'Published' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Note: This content is {status.toLowerCase()}. The shared link will only work once the content is published.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
