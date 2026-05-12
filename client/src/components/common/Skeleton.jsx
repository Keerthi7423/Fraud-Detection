import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-[#1A1D27] rounded ${className}`}></div>
  );
};

export const TransactionRowSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 border-b border-[#2A2D3E]">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-8 w-24 rounded-full" />
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-48" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-6 space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

export default Skeleton;
