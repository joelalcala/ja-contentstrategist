import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const TableLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex space-x-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-8 w-1/4" />
    </div>
    {[...Array(10)].map((_, index) => (
      <div key={index} className="flex space-x-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    ))}
  </div>
);
