import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, WifiOff } from 'lucide-react';
import { checkSheetConnection } from '../services/sheets';
import toast from 'react-hot-toast';
import { Tooltip } from './Tooltip';

export const ConnectionStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<{
    connected: boolean;
    config: {
      hasSheetId: boolean;
      hasClientEmail: boolean;
      hasPrivateKey: boolean;
    };
    error?: string;
    lastCheck?: Date;
  } | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 1000;

  const handleOnlineStatusChange = useCallback(() => {
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      toast.success('Internet connection restored', {
        icon: <WifiOff className="w-4 h-4" />,
        duration: 3000,
      });
      checkConnection(true);
    } else {
      toast.error('Internet connection lost', {
        icon: <WifiOff className="w-4 h-4" />,
        duration: 3000,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [handleOnlineStatusChange]);

  const checkConnection = async (showToast = true) => {
    if (isChecking || !navigator.onLine) return;

    setIsChecking(true);
    try {
      const result = await checkSheetConnection();
      setStatus({
        ...result,
        lastCheck: new Date()
      });

      if (showToast) {
        if (result.connected) {
          toast.success('Google Sheets connection is active', {
            icon: <CheckCircle className="w-4 h-4 text-green-500" />,
            duration: 3000,
          });
          setRetryCount(0);
        } else {
          const missingConfig = [];
          if (!result.config.hasSheetId) missingConfig.push('Sheet ID');
          if (!result.config.hasClientEmail) missingConfig.push('Client Email');
          if (!result.config.hasPrivateKey) missingConfig.push('Private Key');

          if (missingConfig.length > 0) {
            toast.error(`Missing configuration: ${missingConfig.join(', ')}`, {
              duration: 5000,
            });
          } else {
            // If it's a connection error and we haven't exceeded max retries, try again
            if (retryCount < maxRetries) {
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                checkConnection(false);
              }, retryDelay * Math.pow(2, retryCount));
            } else {
              toast.error('Failed to connect to Google Sheets', {
                duration: 5000,
              });
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({
        connected: false,
        config: {
          hasSheetId: false,
          hasClientEmail: false,
          hasPrivateKey: false
        },
        error: errorMessage,
        lastCheck: new Date()
      });

      if (showToast) {
        toast.error('Connection check failed. Retrying...', {
          duration: 3000,
        });

        // Implement retry logic
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            checkConnection(false);
          }, retryDelay * Math.pow(2, retryCount));
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection(false);
    
    // Set up periodic checks every 5 minutes
    const intervalId = setInterval(() => {
      checkConnection(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getTooltipContent = () => {
    if (!isOnline) return 'No internet connection';
    if (isChecking) return 'Checking connection...';
    if (!status) return 'Connection status unknown';
    if (status.connected) return `Last successful check: ${status.lastCheck?.toLocaleTimeString()}`;
    return status.error || 'Connection failed';
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <button
        onClick={() => checkConnection(true)}
        disabled={isChecking || !isOnline}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          !isOnline
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : isChecking
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            : status?.connected
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
        } border ${
          !isOnline
            ? 'border-gray-200 dark:border-gray-700'
            : status?.connected
            ? 'border-green-200 dark:border-green-800'
            : 'border-red-200 dark:border-red-800'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 mr-2" />
            Offline
          </>
        ) : isChecking ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : status?.connected ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Connected
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            {retryCount > 0 ? `Retry ${retryCount}/${maxRetries}` : 'Check Connection'}
          </>
        )}
      </button>
    </Tooltip>
  );
};