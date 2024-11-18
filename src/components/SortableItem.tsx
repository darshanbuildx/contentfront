import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentItem } from '../types';
import { ContentCard } from './ContentCard';

interface SortableItemProps {
  item: ContentItem;
  isActive: boolean;
  onViewItem: (item: ContentItem) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ item, isActive, onViewItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
      status: item.status
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: [
      transition,
      'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)'
    ].join(', '),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
    touchAction: 'none',
    userSelect: 'none' as const,
    willChange: 'transform, opacity, box-shadow',
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button') || target.closest('a');
    
    if (!isDragging && !isInteractive) {
      onViewItem(item);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-manipulation transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-xl z-50' : ''
      } ${active ? 'cursor-grabbing' : 'cursor-grab hover:scale-[1.02]'}`}
      data-draggable="true"
      role="button"
      aria-pressed={isDragging}
      tabIndex={0}
    >
      <ContentCard
        item={item}
        onApprove={() => {}}
        onRequestChanges={() => {}}
        showButtons={false}
        disableModal={false}
        className={`hover:shadow-md transition-all duration-200 ${
          isDragging 
            ? 'shadow-xl ring-2 ring-blue-500 dark:ring-blue-400 transform rotate-1' 
            : 'hover:shadow-lg hover:-translate-y-0.5'
        }`}
        onViewClick={handleClick}
      />
    </div>
  );
};
