import React from 'react';

const LoadingSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-4 p-4 border-b border-[#2A2D3E] bg-[#11131C]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-[#1A1D27] rounded animate-pulse w-full"></div>
        ))}
      </div>
      
      {/* Row Skeletons */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border-b border-[#1A1D27] animate-pulse">
          <div className="h-4 bg-[#1A1D27] rounded w-24"></div>
          <div className="h-4 bg-[#1A1D27] rounded w-32"></div>
          <div className="h-4 bg-[#1A1D27] rounded w-full"></div>
          <div className="h-4 bg-[#1A1D27] rounded w-20"></div>
          <div className="h-8 bg-[#1A1D27] rounded-full w-24"></div>
          <div className="h-8 bg-[#1A1D27] rounded-lg w-10"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
