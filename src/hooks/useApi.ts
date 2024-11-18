import { useState, useCallback, useEffect } from 'react';
import { ContentItem } from '../types';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      apiService.resetConnectionRetries();
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadContent = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('API is not available');
      }
      
      const data = await apiService.getContent();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  const updateStatus = useCallback(async (id: string, status: string, feedback?: string) => {
    if (!isOnline) {
      toast.error('Cannot update status while offline');
      throw new Error('No internet connection');
    }

    setError(null);
    try {
      await apiService.updateContentStatus(id, status, feedback);
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [isOnline]);

  const syncContent = useCallback(async (items: ContentItem[]) => {
    if (!isOnline) {
      toast.error('Cannot sync content while offline');
      throw new Error('No internet connection');
    }

    setError(null);
    try {
      await apiService.syncContent(items);
      toast.success('Content synced successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync content';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [isOnline]);

  return {
    isLoading,
    error,
    isOnline,
    loadContent,
    updateStatus,
    syncContent,
    getLastSuccessfulConnection: apiService.getLastSuccessfulConnection.bind(apiService)
  };
}
