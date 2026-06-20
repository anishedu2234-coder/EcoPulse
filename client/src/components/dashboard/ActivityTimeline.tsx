import React from 'react';

interface Activity {
  id: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Waste';
  activityDesc: string;
  co2e: number;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onLogClick: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onLogClick,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      <div className="flex justify-between items-center mb-8 border-b border-neutral-50 pb-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Recent Activity</h3>
          <p className="text-xs text-[#a3a3a3] font-medium mt-0.5">Chronology of your logged footprint moments</p>
        </div>
        <button
          onClick={onLogClick}
          className="text-xs font-bold text-[#2d3b28] hover:underline flex items-center gap-1 hover-lift-button"
        >
          <span className="material-symbols-outlined text-[15px]">edit</span>
          Log new
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-3xl text-neutral-300 mb-2">import_contacts</span>
          <p className="text-sm text-neutral-400 font-semibold">Your journal timeline is empty.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-7 before:w-[1px] before:bg-neutral-100 select-none">
          {activities.slice(0, 4).map((act) => (
            <div key={act.id} className="relative flex items-start gap-4 group">
              <div className="w-14 h-14 rounded-full bg-[#FFF8F2] border border-neutral-100 flex items-center justify-center z-10 shrink-0 shadow-sm text-[#1a1a1a] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px]">
                  {act.category === 'Transport' ? 'directions_car' :
                    act.category === 'Food' ? 'restaurant' :
                      act.category === 'Energy' ? 'bolt' :
                        act.category === 'Shopping' ? 'shopping_bag' : 'delete'}
                </span>
              </div>
              <div className="flex-1 bg-[#FFF8F2]/30 p-4 border border-[#f5eae0]/30 rounded-[20px] transition-all hover:bg-[#FFF8F2]/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3a3a3]">{act.category}</span>
                  <span className="text-[10px] text-[#a3a3a3] font-bold">
                    {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="font-display font-bold text-sm text-[#1a1a1a] mb-3 leading-snug">{act.activityDesc}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-50 rounded-full text-xs shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                  <span className="font-mono font-black text-[#2d3b28]">{act.co2e}</span>
                  <span className="text-[#a3a3a3] font-bold text-[10px]">kg CO₂</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
