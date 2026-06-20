import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface GoalChallenge {
  id: string;
  title: string;
  objective: string;
  category: string;
  impact: string;
  reward: string;
  progress: number;
  target: number;
  status: 'not_joined' | 'active' | 'completed';
  icon: string;
}

interface Activity {
  id: string;
  category: string;
  co2e: number;
}

export const Challenges: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [goals, setGoals] = useState<GoalChallenge[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGoalsAndActivities = async () => {
    setLoading(true);
    try {
      const [goalsRes, activitiesRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/activities')
      ]);
      setGoals(goalsRes.data);
      setActivities(activitiesRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load intentions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndActivities();
  }, []);

  const handleJoin = async (id: string) => {
    setError('');
    try {
      await api.post('/challenges/join', { challengeId: id });
      await fetchGoalsAndActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set intention.');
    }
  };

  const handleLogProgress = async (id: string) => {
    setError('');
    try {
      await api.post('/challenges/log', { challengeId: id });
      await fetchGoalsAndActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update progress.');
    }
  };

  // Determine user's highest emission category based on logged activities
  const getHighestEmissionCategory = () => {
    if (activities.length === 0) return 'None';
    const sums: Record<string, number> = {};
    activities.forEach(a => {
      sums[a.category] = (sums[a.category] || 0) + a.co2e;
    });
    const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };
  const highestCategory = getHighestEmissionCategory();

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  // Metadata mappings for enrichments
  const getMetadata = (category: string) => {
    switch (category) {
      case 'Transport':
        return {
          savings: '45 kg CO₂ / mo',
          forecast: 'Save 540 kg CO₂ annually by sustaining this habit',
          difficulty: 'Medium',
          impact: 'High',
          difficultyColor: 'bg-[#FFF4D6] text-[#b89535] border-[#b89535]/20',
          impactColor: 'bg-[#FFE5DD] text-[#c96c57] border-[#c96c57]/20',
          recommendation: `Recommended because Transport represents your highest emission area (${highestCategory}).`
        };
      case 'Food':
        return {
          savings: '32 kg CO₂ / mo',
          forecast: 'Save 384 kg CO₂ annually by sustaining this habit',
          difficulty: 'Easy',
          impact: 'Medium',
          difficultyColor: 'bg-[#DDE8D8] text-[#2d3b28] border-[#b8c7b3]/20',
          impactColor: 'bg-[#FFF4D6] text-[#b89535] border-[#b89535]/20',
          recommendation: `Recommended to balance out diet emissions and build a healthier lifestyle.`
        };
      case 'Energy':
        return {
          savings: '80 kg CO₂ / mo',
          forecast: 'Save 960 kg CO₂ annually by sustaining this habit',
          difficulty: 'Hard',
          impact: 'High',
          difficultyColor: 'bg-[#FFE5DD] text-[#c96c57] border-[#c96c57]/20',
          impactColor: 'bg-[#FFE5DD] text-[#c96c57] border-[#c96c57]/20',
          recommendation: `Recommended to mitigate household power leaks and cut down monthly utility bills.`
        };
      case 'Shopping':
        return {
          savings: '25 kg CO₂ / mo',
          forecast: 'Save 300 kg CO₂ annually by sustaining this habit',
          difficulty: 'Medium',
          impact: 'Medium',
          difficultyColor: 'bg-[#FFF4D6] text-[#b89535] border-[#b89535]/20',
          impactColor: 'bg-[#FFF4D6] text-[#b89535] border-[#b89535]/20',
          recommendation: `Recommended to support circular consumption and quality-focused purchasing.`
        };
      case 'Waste':
        return {
          savings: '18 kg CO₂ / mo',
          forecast: 'Save 216 kg CO₂ annually by sustaining this habit',
          difficulty: 'Easy',
          impact: 'Low',
          difficultyColor: 'bg-[#DDE8D8] text-[#2d3b28] border-[#b8c7b3]/20',
          impactColor: 'bg-[#E8F4FF] text-[#4f85b8] border-[#4f85b8]/20',
          recommendation: `Recommended to keep recyclable materials out of municipal landfill streams.`
        };
      default:
        return {
          savings: '20 kg CO₂ / mo',
          forecast: 'Save 240 kg CO₂ annually by sustaining this habit',
          difficulty: 'Easy',
          impact: 'Medium',
          difficultyColor: 'bg-[#DDE8D8] text-[#2d3b28] border-[#b8c7b3]/20',
          impactColor: 'bg-[#FFF4D6] text-[#b89535] border-[#b89535]/20',
          recommendation: 'Recommended intention to start building sustainable daily patterns.'
        };
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1000px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] page-fade">
      {/* Header */}
      <div className="mb-16 text-center max-w-lg mx-auto select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Aspirations</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Personal Intentions
        </h1>
        <p className="text-lg text-[#525252] font-medium leading-relaxed">
          Commit to new habits. Small, consistent actions write the most powerful chapters of change.
        </p>
      </div>

      {error && (
        <div className="bg-[#FFE5DD]/50 text-[#cc431c] text-sm p-4 rounded-2xl mb-8 flex items-start gap-3 max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex justify-center mb-12 select-none">
        <div className="bg-white/50 border border-[rgba(0,0,0,0.05)] rounded-full p-1.5 flex gap-1 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all ${filter === 'all' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-[#525252] hover:bg-[#FFF8F2]'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all ${filter === 'active' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-[#525252] hover:bg-[#FFF8F2]'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all ${filter === 'completed' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-[#525252] hover:bg-[#FFF8F2]'}`}
          >
            Fulfilled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#2d3b28] mb-4">sync</span>
          <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Gathering intentions...</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl text-[#a3a3a3] mb-4">self_improvement</span>
          <h2 className="font-display text-2xl font-bold mb-2">A blank page</h2>
          <p className="text-lg text-[#525252] font-medium leading-relaxed">
            {filter === 'active' 
              ? "You haven't committed to any new intentions yet. Take a look at the 'Discover' tab." 
              : "No fulfilled intentions yet. Keep nurturing your active habits."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progressPercentage = Math.round((goal.progress / goal.target) * 100);
            const meta = getMetadata(goal.category);
            
            // Determine card styling based on state
            let bgStyle = 'bg-white';
            let iconColor = 'text-[#2d3b28]';
            let ringColor = 'ring-1 ring-[rgba(0,0,0,0.04)]';
            
            if (goal.status === 'active') {
              bgStyle = 'bg-[#FFF8F2]';
              iconColor = 'text-[#1a1a1a]';
              ringColor = 'ring-1 ring-[#2d3b28]/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)]';
            } else if (goal.status === 'completed') {
              bgStyle = 'bg-[#DDE8D8]/50';
              iconColor = 'text-[#2d3b28]';
            }

            // Flag if this challenge matches highest emission category
            const isHighestImpactCategory = goal.category === highestCategory;

            return (
              <div 
                key={goal.id} 
                className={`rounded-[32px] p-8 flex flex-col transition-all hover-scale-card relative overflow-hidden group ${bgStyle} ${ringColor}`}
              >
                {/* Decorative background blur for active cards */}
                {goal.status === 'active' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full filter blur-xl -translate-y-10 translate-x-10 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                )}

                <div className="flex justify-between items-start mb-4 relative z-10 select-none">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-[rgba(0,0,0,0.04)] ${iconColor}`}>
                    <span className="material-symbols-outlined text-[24px]">{goal.icon}</span>
                  </div>
                  {goal.status === 'completed' && (
                    <span className="bg-white text-[#2d3b28] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                      Fulfilled
                    </span>
                  )}
                  {goal.status === 'active' && (
                    <span className="bg-white text-[#1a1a1a] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                      In Progress
                    </span>
                  )}
                  {goal.status === 'not_joined' && isHighestImpactCategory && (
                    <span className="bg-[#FFE5DD] text-[#c96c57] border border-[#c96c57]/15 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Difficulty & Impact Badges */}
                <div className="flex gap-1.5 mb-4 select-none">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${meta.difficultyColor}`}>
                    {meta.difficulty} Diff
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${meta.impactColor}`}>
                    {meta.impact} Impact
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-2 relative z-10">
                  {goal.title}
                </h3>
                
                {/* Behavioral Recommendation Message */}
                <p className="text-[10px] font-bold text-[#2d3b28] uppercase tracking-wide mb-3 bg-white/40 p-2.5 rounded-xl border border-neutral-100/30">
                  💡 {isHighestImpactCategory ? meta.recommendation : 'Intentional choice to balance your environmental footprint.'}
                </p>

                <p className="text-[#525252] text-xs leading-relaxed mb-6 flex-1 relative z-10 font-medium">
                  {goal.objective}
                </p>

                <div className="space-y-6 mt-auto relative z-10">
                  
                  {/* Performance Forecast / Rewards Stats */}
                  <div className="grid grid-cols-2 gap-3 border-t border-[rgba(0,0,0,0.05)] pt-4 text-left select-none">
                    <div>
                      <span className="text-[9px] text-[#a3a3a3] font-bold block uppercase tracking-wider">Savings</span>
                      <span className="text-xs font-bold text-[#2d3b28]">{meta.savings}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#a3a3a3] font-bold block uppercase tracking-wider">Reward</span>
                      <span className="text-xs font-bold text-[#525252]">{goal.reward || '+10 Eco Score'}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#a3a3a3] leading-normal font-medium italic border-t border-neutral-50 pt-2 select-none">
                    {meta.forecast}
                  </p>

                  {/* Progress visualization */}
                  {goal.status !== 'not_joined' && (
                    <div className="space-y-2 select-none">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#a3a3a3]">
                        <span>Journey</span>
                        <span className="font-mono text-[#1a1a1a]">{goal.progress} / {goal.target}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[rgba(0,0,0,0.05)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1a1a1a] rounded-full transition-all duration-1000"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div>
                    {goal.status === 'not_joined' && (
                      <button 
                        onClick={() => handleJoin(goal.id)}
                        className="w-full py-3 bg-transparent border-2 border-[rgba(0,0,0,0.05)] hover:border-[#1a1a1a] text-[#1a1a1a] font-semibold rounded-2xl text-xs transition-colors hover-lift-button"
                      >
                        Commit to this
                      </button>
                    )}
                    
                    {goal.status === 'active' && (
                      <button 
                        onClick={() => handleLogProgress(goal.id)}
                        className="w-full py-3 bg-[#1a1a1a] hover:bg-black text-white font-semibold rounded-2xl text-xs transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 hover-lift-button"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_task</span>
                        Log Step
                      </button>
                    )}

                    {goal.status === 'completed' && (
                      <div className="w-full py-2.5 text-center text-[#2d3b28] font-bold text-xs bg-white rounded-2xl shadow-sm border border-[rgba(0,0,0,0.04)] select-none">
                        A Beautiful Milestone
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-20 flex justify-center select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
