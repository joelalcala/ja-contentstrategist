import React from 'react';
import { Filter, File } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export const TableActions: React.FC<TableActionsProps> = ({ onFilterClick, onExportClick }) => {
  return (
    <div className="ml-auto flex items-center gap-2">
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
