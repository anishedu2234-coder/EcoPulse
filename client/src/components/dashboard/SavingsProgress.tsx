import React from 'react';

interface WeeklySavings {
  co2: number;
  pct: number;
}

interface SavingsProgressProps {
  weeklySavings: WeeklySavings;
}

export const SavingsProgress: React.FC<SavingsProgressProps> = ({
  weeklySavings,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between hover-scale-card">
      <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Weekly Savings Progress</span>
      <div className="space-y-2">
        <h4 className="text-2xl font-display font-extrabold text-[#1a1a1a]">
          {weeklySavings.co2 > 0 ? `${weeklySavings.co2} kg saved` : `${Math.abs(weeklySavings.co2)} kg over`}
        </h4>
        <p className="text-sm text-[#525252] font-semibold flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${weeklySavings.co2 > 0 ? 'text-[#2d3b28]' : 'text-[#cc431c]'}`}>
            {weeklySavings.co2 > 0 ? 'arrow_downward' : 'arrow_upward'}
          </span>
          {weeklySavings.co2 > 0
            ? `${weeklySavings.pct}% improvement vs baseline targets`
            : `${Math.abs(weeklySavings.pct)}% increase this week`
          }
        </p>
        <p className="text-[11px] text-[#a3a3a3] leading-normal font-medium mt-1">
          Comparing all records over the past 7 days against your personal regional baseline.
        </p>
      </div>
    </div>
  );
};
