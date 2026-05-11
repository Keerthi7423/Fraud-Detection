import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] hover:border-[#3B82F6] transition-all duration-300 shadow-lg group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-[#94A3B8] text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-[#F1F5F9] tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
