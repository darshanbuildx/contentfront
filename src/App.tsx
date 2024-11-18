import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { SignIn } from './components/SignIn';
import { SharedPost } from './components/SharedPost';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { ViewMode, ContentItem, Status } from './types';
import { useTheme } from './context/ThemeContext';
import { apiService } from './services/api';

const ToasterWrapper = () => {
  const { theme } = useTheme();
  
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{
        bottom: 40,
        right: 20,
      }}
      gutter={8}
      toastOptions={{
        className: '',
        style: {
          background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
          padding: '16px',
          borderRadius: '8px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '420px',
          animation: 'custom-enter 0.2s ease',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
          duration: 4000,
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
          duration: 5000,
        },
        loading: {
          iconTheme: {
            primary: '#6366F1',
            secondary: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
          duration: 3000,
        }
      }}
    />
  );
};

export const App: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    const saved = localStorage.getItem('isSignedIn');
    return saved === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (!isSignedIn) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching content from API...');
      const content = await apiService.getContent();
      console.log('Content fetched:', content);
      setItems(content);
    } catch (err) {
      console.error('Error loading content:', err);
      const message = err instanceof Error ? err.message : 'Failed to load content';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSignIn = (value: boolean) => {
    setIsSignedIn(value);
    localStorage.setItem('isSignedIn', String(value));
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.removeItem('isSignedIn');
    setItems([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUpdateStatus = async (itemId: string, newStatus: Status) => {
    try {
      await apiService.updateContentStatus(itemId, newStatus);
      await loadContent(); // Reload content after update
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApprove = async (id: string) => {
    await handleUpdateStatus(id, 'Approved');
  };

  const handleRequestChanges = async (id: string, feedback: string) => {
    try {
      await apiService.updateContentStatus(id, 'Changes Requested', feedback);
      await loadContent(); // Reload content after update
    } catch (err) {
      console.error('Error requesting changes:', err);
    }
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/post/:id" element={<SharedPost />} />
            <Route
              path="/*"
              element={
                !isSignedIn ? (
                  <SignIn onSignIn={handleSignIn} />
                ) : (
                  <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <Header 
                      onSignOut={handleSignOut} 
                      onSearch={handleSearch}
                      onToggleSidebar={toggleSidebar}
                      isSidebarOpen={isSidebarOpen}
                    />
                    <div className="flex-1 flex overflow-hidden">
                      <Sidebar 
                        currentView={currentView}
                        onViewChange={handleViewChange}
                        isOpen={isSidebarOpen}
                        onToggle={toggleSidebar}
                      />
                      <main className={`flex-1 transition-all duration-300 overflow-hidden ${
                        isSidebarOpen ? 'ml-48' : 'ml-16'
                      }`}>
                        <div className="h-full p-6 overflow-auto">
                          {currentView === 'list' ? (
                            <Dashboard 
                              searchQuery={searchQuery}
                              onApprove={handleApprove}
                              onRequestChanges={handleRequestChanges}
                              onUpdateStatus={handleUpdateStatus}
                              isLoading={isLoading}
                              error={error}
                            />
                          ) : (
                            <KanbanBoard 
                              items={items}
                              onUpdateStatus={handleUpdateStatus}
                              onApprove={handleApprove}
                              onRequestChanges={handleRequestChanges}
                            />
                          )}
                        </div>
                      </main>
                    </div>
                  </div>
                )
              }
            />
          </Routes>
          <ToasterWrapper />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
