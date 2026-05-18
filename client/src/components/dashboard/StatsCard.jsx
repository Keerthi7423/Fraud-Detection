import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, iconColor, color, trend }) => {
  // Support both color and iconColor props
  const displayColor = iconColor || color || 'bg-blue-500';
  
  // Format color classes safely for Tailwind
  const textClass = displayColor.includes('bg-') ? displayColor.replace('bg-', 'text-') : displayColor;
  const bgClass = displayColor.includes('bg-') ? displayColor : `bg-${displayColor}`;

  return (
    <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] hover:border-[#3B82F6] transition-all duration-300 shadow-lg group relative overflow-hidden flex flex-col justify-between">
      {/* Background glow on hover */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${bgClass} opacity-[0.02] blur-2xl group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
      
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[#94A3B8] text-sm font-medium tracking-wide">{title}</h3>
          </div>
          {/* Icon top-right in colored circle */}
          <div className={`p-3 rounded-full ${bgClass} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
            <Icon className={`w-5 h-5 ${textClass}`} />
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-2xl md:text-3xl font-bold text-[#F1F5F9] font-mono tracking-tight">{value}</p>
        </div>
      </div>

      {/* Optional Subtitle */}
      {subtitle && (
        <p className="text-[#64748B] text-xs mt-2 font-medium">{subtitle}</p>
      )}

      {/* Optional Trend Badge */}
      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-[#64748B] text-xs font-medium">risk density</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
