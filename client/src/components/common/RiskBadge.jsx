import React from 'react';

const RiskBadge = ({ score }) => {
  let color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  let label = 'Low Risk';

  if (score >= 70) {
    color = 'bg-red-500/10 text-red-500 border-red-500/20';
    label = 'High Risk';
  } else if (score >= 40) {
    color = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    label = 'Medium Risk';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
      {label} ({score}%)
    </span>
  );
};

export default RiskBadge;
