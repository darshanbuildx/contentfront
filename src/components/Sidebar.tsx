import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Archive
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isDisabled?: boolean;
  comingSoon?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange,
  isOpen,
  onToggle
}) => {
  const mainNavItems: NavItem[] = [
    {
      id: 'list',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: <Kanban className="w-5 h-5 flex-shrink-0" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart2 className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    },
    {
      id: 'calendar',
      label: 'Content Calendar',
      icon: <Calendar className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    }
  ];

  const contentNavItems: NavItem[] = [
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    }
  ];

  const collaborationNavItems: NavItem[] = [
    {
      id: 'team',
      label: 'Team Members',
      icon: <Users className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
      comingSoon: true
    }
  ];

  const renderNavItem = (item: NavItem) => (
    <button
      key={item.id}
      onClick={() => !item.comingSoon && onViewChange(item.id as ViewMode)}
      disabled={item.isDisabled || item.comingSoon}
      className={`flex items-center justify-${isOpen ? 'start' : 'center'} w-full px-4 py-3 mx-2 rounded-lg transition-colors relative group ${
        currentView === item.id
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${(item.isDisabled || item.comingSoon) ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={item.label}
    >
      {item.icon}
      {isOpen && (
        <span className="ml-3 text-sm">
          {item.label}
          {item.comingSoon && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
              Soon
            </span>
          )}
        </span>
      )}
      {!isOpen && item.comingSoon && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {item.label} (Coming Soon)
        </div>
      )}
    </button>
  );

  return (
    <div 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 flex flex-col transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex-1 flex flex-col w-full py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map(renderNavItem)}
        </div>

        {isOpen && (
          <div className="px-4 py-2 mt-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Content
            </h3>
          </div>
        )}
        <div className="space-y-1">
          {contentNavItems.map(renderNavItem)}
        </div>

        {isOpen && (
          <div className="px-4 py-2 mt-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Collaboration
            </h3>
          </div>
        )}
        <div className="space-y-1">
          {collaborationNavItems.map(renderNavItem)}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => {}}
            className={`flex items-center justify-${isOpen ? 'start' : 'center'} w-full px-4 py-3 mx-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="ml-3 text-sm">Settings</span>}
          </button>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 transform bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md dark:shadow-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};