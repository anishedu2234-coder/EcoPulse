import React from 'react';

interface ReflectionStatsProps {
  totalWritten: number;
  uniqueThemes: number;
  mostUsedTag: string;
}

export const ReflectionStats: React.FC<ReflectionStatsProps> = ({
  totalWritten,
  uniqueThemes,
  mostUsedTag,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 bg-white border border-neutral-100 rounded-[28px] p-6 text-center select-none shadow-sm">
      <div>
        <span className="text-2xl font-display font-black text-[#2d3b28] block">{totalWritten}</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mt-0.5">Written Letters</span>
      </div>
      <div className="border-x border-neutral-50">
        <span className="text-2xl font-display font-black text-[#4f85b8] block">{uniqueThemes}</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mt-0.5">Themes Explored</span>
      </div>
      <div>
        <span className="text-2xl font-display font-black text-[#b89535] block">{mostUsedTag}</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mt-0.5">Primary Mood</span>
      </div>
    </div>
  );
};
