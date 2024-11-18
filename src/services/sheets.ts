import { ContentItem, Status } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

interface ConnectionStatus {
  connected: boolean;
  config: {
    hasSheetId: boolean;
    hasClientEmail: boolean;
    hasPrivateKey: boolean;
  };
  columns?: string[];
  error?: string;
  lastSync?: Date;
}

interface SheetContent {
  id: string;
  content: string;
  platform: string;
  status: Status;
  lastSync?: Date;
}

export const checkSheetConnection = async (): Promise<ConnectionStatus> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${API_URL}/api/health`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      throw new Error('Invalid API response type. Expected JSON, got HTML. Check API URL configuration.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data?.sheets?.status) {
      throw new Error('Invalid response format from API');
    }

    return {
      connected: data.sheets.status === 'connected',
      config: data.sheets.config || {
        hasSheetId: false,
        hasClientEmail: false,
        hasPrivateKey: false
      },
      columns: data.sheets.columns,
      error: data.sheets.error,
      lastSync: data.sheets.lastSync ? new Date(data.sheets.lastSync) : undefined
    };
  } catch (error) {
    console.error('Connection check failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please try again.');
    }

    throw error instanceof Error ? error : new Error('Failed to check connection');
  }
};

export const getContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const response = await fetch(`${API_URL}/api/content/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

export const updateContent = async (id: string, updates: Partial<ContentItem>): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/content/${id}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const syncContent = async (items: ContentItem[]): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/content/sync`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error syncing content:', error);
    throw error;
  }
};

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;
const subscribers = new Map<string, Set<(content: ContentItem) => void>>();

const connectWebSocket = () => {
  if (ws?.readyState === WebSocket.OPEN) return;

  const wsUrl = API_URL.replace(/^http/, 'ws');
  ws = new WebSocket(`${wsUrl}/ws`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as SheetContent;
      const subs = subscribers.get(data.id);
      if (subs) {
        subs.forEach(callback => callback(data as ContentItem));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    // Attempt to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };
};

export const subscribeToContentUpdates = (
  contentId: string,
  callback: (content: ContentItem) => void
) => {
  if (!subscribers.has(contentId)) {
    subscribers.set(contentId, new Set());
  }
  
  subscribers.get(contentId)?.add(callback);
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
  }

  return () => {
    const subs = subscribers.get(contentId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(contentId);
      }
    }
  };
};

// Cleanup function for tests and development
export const cleanup = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  subscribers.clear();
};
