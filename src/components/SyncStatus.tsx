import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { checkSheetConnection } from '../services/sheets';
import toast from 'react-hot-toast';

export const SyncStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    config: {
      hasSheetId: boolean;
      hasClientEmail: boolean;
      hasPrivateKey: boolean;
    };
    error?: string;
  } | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const status = await checkSheetConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        toast.success('Google Sheets connection is active', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          duration: 3000,
        });
      } else {
        const missingConfig = [];
        if (!status.config.hasSheetId) missingConfig.push('Sheet ID');
        if (!status.config.hasClientEmail) missingConfig.push('Client Email');
        if (!status.config.hasPrivateKey) missingConfig.push('Private Key');

        if (missingConfig.length > 0) {
          toast.error(`Missing configuration: ${missingConfig.join(', ')}`, {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
            duration: 5000,
          });
        } else {
          toast.error(status.error || 'Google Sheets connection failed', {
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        config: {
          hasSheetId: false,
          hasClientEmail: false,
          hasPrivateKey: false
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error('Failed to check connection status', {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        duration: 5000,
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <button
      onClick={checkConnection}
      disabled={isChecking}
      className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
        isChecking
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
          : connectionStatus === null
          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
          : connectionStatus.connected
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30'
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30'
      }`}
    >
      <RefreshCw 
        className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} 
      />
      {isChecking ? 'Checking Connection...' : 'Check Sheets Connection'}
    </button>
  );
};