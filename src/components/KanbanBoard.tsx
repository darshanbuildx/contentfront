import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column, ContentItem, Status } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { ContentCard } from './ContentCard';
import { Modal } from './Modal';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Clock, Rocket, FileEdit, PencilLine } from 'lucide-react';

interface KanbanBoardProps {
  items: ContentItem[];
  onUpdateStatus: (itemId: string, newStatus: Status) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onRequestChanges: (id: string, feedback: string) => Promise<void>;
}

const VALID_STATUSES: Status[] = ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Published'];

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  onUpdateStatus,
  onApprove,
  onRequestChanges,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [localItems, setLocalItems] = useState<ContentItem[]>(items);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        tolerance: 5,
        delay: 0,
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = localItems.find(item => item.id === active.id);
    if (draggedItem) {
      setActiveId(active.id as string);
      setActiveItem(draggedItem);
      setIsDragging(true);
      document.body.style.cursor = 'grabbing';
    }
  }, [localItems]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setCurrentStatus(null);
      return;
    }

    const overId = over.id as string;
    const isTopDropZone = overId.endsWith('-top');
    const status = isTopDropZone ? overId.replace('-top', '') as Status : overId as Status;

    if (VALID_STATUSES.includes(status)) {
      setCurrentStatus(status);
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveId(null);
    setActiveItem(null);
    setCurrentStatus(null);
    document.body.style.cursor = '';

    if (!over) return;

    const overId = over.id as string;
    const isTopDropZone = overId.endsWith('-top');
    const status = isTopDropZone ? overId.replace('-top', '') as Status : overId as Status;

    if (!VALID_STATUSES.includes(status)) return;

    const draggedItem = localItems.find(item => item.id === active.id);
    
    if (!draggedItem || draggedItem.status === status) return;

    try {
      setLocalItems(prevItems =>
        prevItems.map(item =>
          item.id === active.id ? { ...item, status } : item
        )
      );

      const icons = {
        Draft: <FileEdit className="w-5 h-5" />,
        'In Review': <Clock className="w-5 h-5" />,
        'Changes Requested': <AlertCircle className="w-5 h-5" />,
        'Approved': <CheckCircle className="w-5 h-5" />,
        'Published': <Rocket className="w-5 h-5" />
      };

      toast.success(`Moved to ${status}`, {
        icon: icons[status],
        duration: 2000
      });

      await onUpdateStatus(active.id as string, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      setLocalItems(prevItems =>
        prevItems.map(item =>
          item.id === active.id ? { ...item, status: draggedItem.status } : item
        )
      );
      toast.error('Failed to update status');
    }
  }, [localItems, onUpdateStatus]);

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setActiveId(null);
    setActiveItem(null);
    setCurrentStatus(null);
    document.body.style.cursor = '';
  }, []);

  const handleViewItem = useCallback((item: ContentItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  }, []);

  const handleRequestChanges = useCallback(async () => {
    if (feedback.trim() && selectedItem) {
      try {
        await onRequestChanges(selectedItem.id, feedback);
        setFeedback('');
        setIsChangeModalOpen(false);
        setSelectedItem(null);
      } catch (err) {
        console.error('Failed to request changes:', err);
        toast.error('Failed to request changes');
      }
    }
  }, [feedback, onRequestChanges, selectedItem]);

  const columns: Column[] = [
    { id: 'Draft', title: '📝 Draft', items: [] },
    { id: 'In Review', title: '👀 In Review', items: [] },
    { id: 'Changes Requested', title: '✏️ Changes Requested', items: [] },
    { id: 'Approved', title: '✅ Approved', items: [] },
    { id: 'Published', title: '🚀 Published', items: [] },
  ];

  localItems.forEach(item => {
    const column = columns.find(col => col.id === item.status);
    if (column) {
      column.items.push(item);
    }
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={measuring}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            activeId={activeId}
            currentStatus={currentStatus}
            onViewItem={handleViewItem}
            isDragging={isDragging}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem && (
          <div className="transform rotate-3 w-80">
            <ContentCard
              item={activeItem}
              onApprove={onApprove}
              onRequestChanges={onRequestChanges}
              showButtons={false}
              disableModal={true}
              className="opacity-90 shadow-2xl"
            />
          </div>
        )}
      </DragOverlay>

      {selectedItem && (
        <>
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedItem(null);
            }}
            title={`${selectedItem.platform} Content - ${selectedItem.id}`}
            item={selectedItem}
          >
            <div className="space-y-4">
              {selectedItem.lastFeedback && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Latest Feedback:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
                    {selectedItem.lastFeedback}
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
                  onClick={async () => {
                    try {
                      await onApprove(selectedItem.id);
                      setIsViewModalOpen(false);
                      setSelectedItem(null);
                    } catch (err) {
                      console.error('Failed to approve:', err);
                      toast.error('Failed to approve content');
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isChangeModalOpen}
            onClose={() => {
              setIsChangeModalOpen(false);
              setSelectedItem(null);
              setFeedback('');
            }}
            title="Request Changes"
            item={selectedItem}
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
                    setSelectedItem(null);
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
        </>
      )}
    </DndContext>
  );
};
