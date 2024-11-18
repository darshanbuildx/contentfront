import React, { useState } from 'react';
import { ContentItem } from '../types';
import { ContentCard } from './ContentCard';
import { BatchActions } from './BatchActions';

interface ContentListProps {
  items: ContentItem[];
  onApprove: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onUpdateStatus: (id: string, status: ContentItem['status']) => void;
}

export const ContentList: React.FC<ContentListProps> = ({
  items,
  onApprove,
  onRequestChanges,
  onUpdateStatus,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleApproveAll = () => {
    selectedIds.forEach(id => onApprove(id));
    setSelectedIds([]);
  };

  const handleRejectAll = () => {
    // For batch rejection, we'll use a standard message
    const standardFeedback = "Changes requested as part of batch action";
    selectedIds.forEach(id => onRequestChanges(id, standardFeedback));
    setSelectedIds([]);
  };

  const currentStatus = items[0]?.status;

  return (
    <div className="relative">
      <div className="space-y-4">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onApprove={onApprove}
            onRequestChanges={onRequestChanges}
            isSelectable={true}
            isSelected={selectedIds.includes(item.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <BatchActions
        selectedIds={selectedIds}
        onApproveAll={handleApproveAll}
        onRejectAll={handleRejectAll}
        onClearSelection={() => setSelectedIds([])}
        currentStatus={currentStatus}
      />
    </div>
  );
};