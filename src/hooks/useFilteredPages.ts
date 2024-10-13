import { useMemo } from 'react';
import { CrawlPage } from '@/lib/api/types';

interface FilteredPagesProps {
  pages: CrawlPage[];
  searchQuery: string;
  activeFilters: Record<string, any>;
  selectedPath: string;
}

export function useFilteredPages({ pages, searchQuery, activeFilters, selectedPath }: FilteredPagesProps) {
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        (page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.url?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.content_type?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesActiveFilters = Object.entries(activeFilters).every(([key, values]) => {
        if (!values || values === "all") return true;
        if (key === 'content_type') {
          return values === page.content_type;
        }
        if (key === 'urlContains') {
          return page.url?.includes(values as string) ?? false;
        }
        return values === page.custom_fields?.[key];
      });

      const matchesPath = selectedPath === "all" || selectedPath === "/" || 
        (page.url && new URL(page.url).pathname.startsWith(selectedPath));

      return matchesSearch && matchesActiveFilters && matchesPath;
    });
  }, [pages, searchQuery, activeFilters, selectedPath]);

  return filteredPages;
}
