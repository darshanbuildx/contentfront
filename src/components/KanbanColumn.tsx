import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, ContentItem, Status } from '../types';
import { SortableItem } from './SortableItem';
import { ArrowDown } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  activeId: string | null;
  currentStatus: Status | null;
  onViewItem: (item: ContentItem) => void;
  isDragging: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  activeId,
  currentStatus,
  onViewItem,
  isDragging
}) => {
  // Top drop zone
  const { setNodeRef: setTopDropRef, isOver: isOverTop } = useDroppable({
    id: `${column.id}-top`,
    data: {
      type: 'column',
      status: column.id,
      accepts: ['item'],
      position: 'top'
    }
  });

  // Bottom drop zone
  const { setNodeRef: setBottomDropRef, isOver: isOverBottom } = useDroppable({
    id: `${column.id}-bottom`,
    data: {
      type: 'column',
      status: column.id,
      accepts: ['item'],
      position: 'bottom'
    }
  });

  // Main column droppable
  const { setNodeRef: setColumnRef, isOver: isOverMain } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      status: column.id,
      accepts: ['item']
    }
  });

  const isCurrentDropTarget = currentStatus === column.id;
  const showDropIndicator = isDragging && (isOverMain || isOverTop || isOverBottom || isCurrentDropTarget);
  const isEmpty = column.items.length === 0;

  const renderDropZone = (position: 'top' | 'bottom' | 'between', index?: number) => {
    const isOver = position === 'top' ? isOverTop : position === 'bottom' ? isOverBottom : false;
    const ref = position === 'top' ? setTopDropRef : position === 'bottom' ? setBottomDropRef : undefined;

    return (
      <div 
        ref={ref}
        className={`px-2 transition-all duration-200 ${
          isOver ? 'py-8' : 'py-4'
        }`}
      >
        <div 
          className={`h-16 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center ${
            isOver 
              ? 'border-blue-400 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className={`flex flex-col items-center transition-all duration-200 ${
            isOver ? 'scale-110' : 'scale-100'
          }`}>
            <ArrowDown className={`w-5 h-5 mb-1 transition-all duration-200 ${
              isOver 
                ? 'text-blue-500 dark:text-blue-400 animate-bounce' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
            <span className={`text-sm font-medium transition-all duration-200 ${
              isOver 
                ? 'text-blue-500 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              Drop here
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={setColumnRef}
      className={`group relative flex-shrink-0 flex flex-col min-h-[calc(100vh-16rem)] w-[320px] rounded-lg transition-all duration-200 ${
        showDropIndicator
          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400 scale-[1.02] shadow-lg'
          : isDragging
          ? 'bg-gray-100/50 dark:bg-gray-800/50 ring-2 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-blue-400/50 dark:hover:ring-blue-400/50'
          : 'bg-gray-100/50 dark:bg-gray-800/50 ring-2 ring-gray-200/50 dark:ring-gray-700/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 relative z-20">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          {column.title}
          <span className="ml-2 px-2 py-0.5 text-sm bg-gray-200/50 dark:bg-gray-700/50 rounded-full font-medium text-gray-700 dark:text-gray-300">
            {column.items.length}
          </span>
        </h3>
      </div>

      {/* Top Drop Zone - Always visible when dragging */}
      {isDragging && renderDropZone('top')}

      {/* Content Container */}
      <div className="flex-1 flex flex-col p-2 relative z-10">
        <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-2 min-h-full transition-all duration-200`}>
            {isEmpty ? (
              // Empty State with Drop Zone
              <div className="h-full min-h-[200px] flex items-center justify-center">
                {isDragging ? (
                  renderDropZone('between')
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 dark:text-gray-500 font-medium text-sm opacity-70">
                      No items
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 opacity-60">
                      Drag items here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Items with Drop Zones between them
              <>
                {column.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <SortableItem
                      item={item}
                      isActive={item.id === activeId}
                      onViewItem={onViewItem}
                    />
                    {isDragging && index < column.items.length - 1 && renderDropZone('between', index)}
                  </React.Fragment>
                ))}
              </>
            )}

            {/* Bottom Drop Zone - Only visible when dragging and column has items */}
            {isDragging && !isEmpty && (
              <div className="mt-2">
                {renderDropZone('bottom')}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
