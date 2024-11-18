import { useState, useCallback, useMemo } from 'react';
import { ContentItem, FilterOptions } from '../types';

export const useSearch = (items: ContentItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${item.content} ${item.topic} ${item.platform}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Platform filter
      if (filters.platform && item.platform !== filters.platform) {
        return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Topic filter
      if (filters.topic && !item.topic.toLowerCase().includes(filters.topic.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt);
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
      }

      return true;
    });
  }, [items, searchQuery, filters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  return {
    filteredItems,
    handleSearch,
    handleFilterChange,
    currentFilters: filters,
  };
};