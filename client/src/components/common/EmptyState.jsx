import React from 'react';
import { Database } from 'lucide-react';

const EmptyState = ({ title = "No data found", description = "We couldn't find any records matching your criteria.", icon: Icon = Database }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#11131C] border border-[#2A2D3E] rounded-xl border-dashed">
      <div className="bg-[#1A1D27] p-4 rounded-full mb-4">
        <Icon className="w-12 h-12 text-[#4B5563]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#94A3B8] max-w-md">{description}</p>
    </div>
  );
};

export default EmptyState;
