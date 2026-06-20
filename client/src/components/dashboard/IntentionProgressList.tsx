import React from 'react';

interface Challenge {
  id: string;
  title: string;
  objective: string;
  category: string;
  progress: number;
  target: number;
  status: 'not_joined' | 'active' | 'completed';
  icon: string;
}

interface IntentionProgressListProps {
  activeChallenges: Challenge[];
  onBrowseClick: () => void;
}

export const IntentionProgressList: React.FC<IntentionProgressListProps> = ({
  activeChallenges,
  onBrowseClick,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-50">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Intentions In Progress</span>
        <button
          onClick={onBrowseClick}
          className="text-[10px] font-bold text-[#2d3b28] hover:underline"
        >
          Browse
        </button>
      </div>

      {activeChallenges.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-[#a3a3a3] font-medium leading-relaxed">
            No active challenges. Choose an intention to start building sustainable habits.
          </p>
          <button
            onClick={onBrowseClick}
            className="mt-3 text-xs font-bold text-[#1a1a1a] bg-neutral-100 hover:bg-neutral-200 py-1.5 px-4 rounded-full transition-all"
          >
            Commit to Intentions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeChallenges.slice(0, 2).map((goal) => {
            const pct = Math.round((goal.progress / goal.target) * 100);
            return (
              <div key={goal.id} className="space-y-2 bg-[#FFF8F2]/30 p-3 rounded-[16px] border border-[rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1a1a1a] truncate pr-2">{goal.title}</span>
                  <span className="font-mono font-bold text-[#525252]">{goal.progress}/{goal.target}</span>
                </div>
                <div className="h-1.5 w-full bg-[rgba(0,0,0,0.05)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2d3b28] rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
