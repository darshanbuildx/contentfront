import { ContentItem, Status } from '../types';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

class ApiService {
  private connectionRetries = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private lastSuccessfulConnection: Date | null = null;
  private cachedContent: ContentItem[] | null = null;

  private async fetchWithTimeout(
    url: string, 
    options: RequestInit = {}, 
    timeout = 5000
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      
      clearTimeout(id);
      
      if (response.ok) {
        this.connectionRetries = 0;
        this.lastSuccessfulConnection = new Date();
      }
      
      return response;
    } catch (error) {
      clearTimeout(id);
      console.error('Fetch error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (this.connectionRetries < this.maxRetries) {
          this.connectionRetries++;
          const delay = this.retryDelay * Math.pow(2, this.connectionRetries - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.fetchWithTimeout(url, options, timeout);
        }
      }
      
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid response type: ${contentType}`);
    }

    const data = await response.json();
    return data as T;
  }

  async getContent(): Promise<ContentItem[]> {
    try {
      console.log('Fetching content from API...');
      const response = await this.fetchWithTimeout(`${API_URL}/api/content`);
      const data = await this.handleResponse<any[]>(response);
      
      this.cachedContent = this.mapContentItems(data);
      return this.cachedContent;
    } catch (error) {
      console.error('Error loading content:', error);
      throw error;
    }
  }

  private mapContentItems(data: any[]): ContentItem[] {
    const contentItems = data.map(item => ({
      id: String(item.id || ''),
      platform: String(item.platform || 'Twitter'),
      topic: String(item.topic || ''),
      content: String(item.content || ''),
      status: String(item.status || 'Draft'),
      createdAt: new Date(item.createdAt || new Date()),
      lastFeedback: item.lastFeedback,
      lastFeedbackDate: item.lastFeedbackDate,
      dateApproved: item.dateApproved,
      approvedBy: item.approvedBy,
      finalApprovalDate: item.finalApprovalDate,
      postScheduledDate: item.postScheduledDate,
      postedBy: item.postedBy,
      postLink: item.postLink
    }));

    const validItems = contentItems.filter(item => 
      item.id && 
      item.platform && 
      item.content && 
      ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Published'].includes(item.status)
    );

    if (validItems.length === 0) {
      console.warn('No valid content items found');
      throw new Error('No valid content items found');
    }

    return validItems;
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    try {
      // First try cached content
      if (this.cachedContent) {
        const cachedItem = this.cachedContent.find(item => item.id === id);
        if (cachedItem) {
          return cachedItem;
        }
      }

      // If not in cache, fetch all content
      const allContent = await this.getContent();
      const item = allContent.find(item => item.id === id);
      
      if (!item) {
        console.log('Content not found:', id);
        return null;
      }

      return item;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }
  }

  async updateContentStatus(id: string, status: string, feedback?: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_URL}/api/content/status`,
        {
          method: 'POST',
          body: JSON.stringify({ id, status, feedback })
        }
      );
      await this.handleResponse<{ message: string }>(response);
      
      // Update cached content
      if (this.cachedContent) {
        this.cachedContent = this.cachedContent.map(item => 
          item.id === id 
            ? { 
                ...item, 
                status, 
                lastFeedback: feedback || item.lastFeedback,
                lastFeedbackDate: feedback ? new Date().toISOString() : item.lastFeedbackDate
              }
            : item
        );
      }
      
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      throw error;
    }
  }

  async syncContent(items: ContentItem[]): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_URL}/api/content/sync`,
        {
          method: 'POST',
          body: JSON.stringify({ items })
        }
      );
      await this.handleResponse<{ message: string }>(response);
      this.cachedContent = items;
      toast.success('Content synced successfully');
    } catch (error) {
      console.error('Error syncing content:', error);
      toast.error('Failed to sync content');
      throw error;
    }
  }

  async checkHealth(): Promise<{
    status: string;
    sheets: {
      status: string;
      config: {
        hasSheetId: boolean;
        hasClientEmail: boolean;
        hasPrivateKey: boolean;
      };
      columns?: string[];
      lastSync?: string;
      error?: string;
    };
  }> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_URL}/api/health`,
        {},
        10000
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  getLastSuccessfulConnection(): Date | null {
    return this.lastSuccessfulConnection;
  }

  resetConnectionRetries(): void {
    this.connectionRetries = 0;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
