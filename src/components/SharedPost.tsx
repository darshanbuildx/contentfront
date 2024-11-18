import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, ExternalLink, Shield, Clock, Calendar, Hash, Globe, Tag, AlertTriangle, Moon, Sun } from 'lucide-react';
import { PlatformPreview } from './PlatformPreview';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { ContentItem } from '../types';

export const SharedPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const content = await apiService.getContentById(id);
        if (!content) {
          throw new Error('Post not found');
        }
        setPost(content);
        setError(null);
      } catch (err) {
        console.error('Error loading post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Content #${id}`,
          text: post?.content,
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Failed to share content');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <LoadingPlaceholder />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400">
            <AlertTriangle className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate content stats
  const wordCount = post.content.trim().split(/\s+/).length;
  const charCount = post.content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Content #{post.id}
                </h1>
                <StatusBadge status={post.status} />
              </div>
              {post.status === 'Published' && post.postLink && (
                <a
                  href={post.postLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live Post
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ID:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{post.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{post.platform}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{post.topic}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                {post.dateApproved && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Approved:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(post.dateApproved), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
                {post.postScheduledDate && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(post.postScheduledDate), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Content Preview
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <PlatformPreview
                platform={post.platform}
                content={post.content}
                author="Hamza"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                Want to manage your content? 
                <Link
                  to="/"
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Sign in to Content Flow
                </Link>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 mr-1" />
                Secured by Scale360X
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
