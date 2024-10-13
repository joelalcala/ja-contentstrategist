import React from 'react';
import { Filter, File, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface TableActionsProps {
  onFilterClick: () => void;
  onExportClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({ 
  onFilterClick, 
  onExportClick, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked onClick={onFilterClick}>Active</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem onClick={onFilterClick}>Draft</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem onClick={onFilterClick}>Archived</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onExportClick}>
        <File className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">Export</span>
      </Button>
    </div>
  );
};
