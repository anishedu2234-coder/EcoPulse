import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  subValueColor: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  subValueColor,
  description,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-start gap-4 hover-scale-card">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0 ${iconColor}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">{title}</span>
        <h4 className="text-xl font-display font-extrabold text-[#1a1a1a]">{value}</h4>
        <p className={`text-xs font-bold ${subValueColor}`}>{subValue}</p>
        <p className="text-[11px] text-[#525252] leading-normal font-medium pt-1">
          {description}
        </p>
      </div>
    </div>
  );
};
