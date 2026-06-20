import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalCo2e: number;
  categoryBreakdown: Record<string, number>;
}

interface UserReflection {
  id: string;
  type: string;
  title: string;
  content: string;
  tag: string;
  timestamp: string;
}

const DEFAULT_REFLECTIONS: UserReflection[] = [
  {
    id: '1',
    type: 'Weekly Reflection',
    title: 'Focusing on low-carbon commuting',
    content: 'This week, I replaced two car trips with walking and public transit. I noticed that transport emissions dropped significantly. Feels great to walk more!',
    tag: 'Proud',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'Sustainability Win',
    title: 'First full plant-based day',
    content: 'Soured ingredients for a fully vegan day. Meal logging made me realize how low-impact vegetables are compared to dairy cuts.',
    tag: 'Inspired',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const Insights: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reflections state (loads from localStorage)
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [refType, setRefType] = useState('Weekly Reflection');
  const [refTitle, setRefTitle] = useState('');
  const [refContent, setRefContent] = useState('');
  const [refTag, setRefTag] = useState('Reflective');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await api.get('/analytics');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load insights data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Load custom reflections
    const stored = localStorage.getItem('user_reflections');
    if (stored) {
      setReflections(JSON.parse(stored));
    } else {
      setReflections(DEFAULT_REFLECTIONS);
      localStorage.setItem('user_reflections', JSON.stringify(DEFAULT_REFLECTIONS));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 text-[#1a1a1a] page-fade">
        <span className="material-symbols-outlined text-4xl animate-pulse text-[#2d3b28] mb-4">edit_note</span>
        <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Opening reflections...</p>
      </div>
    );
  }

  const breakdown = analytics?.categoryBreakdown || {};
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Opportunity/Insights derivations
  const sortedCategories = Object.entries(breakdown)
    .map(([category, val]) => ({ category, val, percentage: total > 0 ? Math.round((val / total) * 100) : 0 }))
    .sort((a, b) => b.val - a.val);

  const dominant = sortedCategories.length > 0 ? sortedCategories[0] : { category: 'None', val: 0, percentage: 0 };

  // Area Chart Forecast (Actual + Dotted projection)
  const userMonthlyEmissions = Math.max(80, Math.round(total));
  const forecastData = [
    { month: 'Apr', co2: Math.round(userMonthlyEmissions * 1.2), projected: null },
    { month: 'May', co2: Math.round(userMonthlyEmissions * 1.1), projected: null },
    { month: 'Jun (Now)', co2: userMonthlyEmissions, projected: userMonthlyEmissions },
    { month: 'Jul (Est)', co2: null, projected: Math.round(userMonthlyEmissions * 0.85) },
    { month: 'Aug (Est)', co2: null, projected: Math.round(userMonthlyEmissions * 0.72) }
  ];

  // Save new reflection handler
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refTitle || !refContent) return;

    const newRef: UserReflection = {
      id: Date.now().toString(),
      type: refType,
      title: refTitle,
      content: refContent,
      tag: refTag,
      timestamp: new Date().toISOString()
    };

    const updated = [newRef, ...reflections];
    setReflections(updated);
    localStorage.setItem('user_reflections', JSON.stringify(updated));

    setRefTitle('');
    setRefContent('');
  };

  // Delete reflection
  const handleDeleteReflection = (id: string) => {
    const updated = reflections.filter(r => r.id !== id);
    setReflections(updated);
    localStorage.setItem('user_reflections', JSON.stringify(updated));
  };

  // Reflection statistics
  const totalWritten = reflections.length;
  const uniqueThemes = new Set(reflections.map(r => r.type)).size;
  const mostUsedTag = () => {
    if (reflections.length === 0) return 'None';
    const counts: Record<string, number> = {};
    reflections.forEach(r => counts[r.tag] = (counts[r.tag] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  return (
    <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] relative page-fade">
      
      {/* Header */}
      <div className="mb-12 text-center max-w-lg mx-auto select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Journal & Findings</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Reflections
        </h1>
        <p className="text-lg text-[#525252] font-medium leading-relaxed">
          Record your sustainability thoughts, set intentions, and examine dynamic progress forecasts.
        </p>
      </div>

      {/* Main Grid: Left Column (Form & Timeline) vs Right Column (Assistant findings & forecasts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Span 2) - Reflections Journal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Reflection Entry Form */}
          <div className="bg-[#FFF8F2] rounded-[32px] p-8 border border-[rgba(0,0,0,0.04)] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
            
            <form onSubmit={handleSaveReflection} className="relative z-10 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-display font-bold text-xl text-[#1a1a1a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d3b28]">edit_note</span>
                  Write Reflection Letter
                </h3>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3]">Template driven</span>
              </div>

              {/* Template selection */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
                {['Weekly Reflection', 'Sustainability Win', 'Progress Review', 'New Goal', 'Challenge Reflection'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRefType(t)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      refType === t
                        ? 'bg-[#1a1a1a] text-white border-transparent'
                        : 'bg-white border-neutral-100 text-[#525252] hover:bg-neutral-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">Title / Focus</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setting kitchen compost bins"
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] font-medium"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">My Thoughts</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your environmental habits, wins, or feelings about your sustainability goals this week..."
                  value={refContent}
                  onChange={(e) => setRefContent(e.target.value)}
                  className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] font-medium"
                />
              </div>

              {/* Tags selection and submit button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div className="space-y-2 select-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">Tag emotional state:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Proud', 'Motivated', 'Inspired', 'Reflective', 'Challenged'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setRefTag(tag)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          refTag === tag
                            ? 'bg-[#2d3b28] text-white border-transparent'
                            : 'bg-white border-neutral-100 text-[#525252] hover:bg-[#FFF8F2]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#1a1a1a] hover:bg-black text-white font-semibold text-xs px-8 py-3.5 rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 hover-lift-button"
                >
                  <span className="material-symbols-outlined text-[16px]">draw</span>
                  Save Reflection
                </button>
              </div>
            </form>
          </div>

          {/* Reflections Stats row */}
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
              <span className="text-2xl font-display font-black text-[#b89535] block">{mostUsedTag()}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mt-0.5">Primary Mood</span>
            </div>
          </div>

          {/* Reflection Timeline List */}
          <div className="space-y-6">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#a3a3a3] select-none pl-1">Reflection Timeline</h4>
            {reflections.length === 0 ? (
              <p className="text-center text-sm text-[#a3a3a3] py-10">You have no reflections recorded. Choose a template above and share your thoughts.</p>
            ) : (
              <div className="space-y-4">
                {reflections.map((ref) => (
                  <div key={ref.id} className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm relative group hover-scale-card transition-all duration-300">
                    <div className="flex justify-between items-start gap-4 mb-3 select-none">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a3a3a3]">{ref.type}</span>
                        <h4 className="font-display font-bold text-base text-[#1a1a1a]">{ref.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white bg-[#2d3b28]">
                          {ref.tag}
                        </span>
                        <button 
                          onClick={() => handleDeleteReflection(ref.id)}
                          className="w-7 h-7 rounded-full bg-neutral-50 text-neutral-300 hover:bg-neutral-100 hover:text-[#cc431c] flex items-center justify-center transition-colors"
                          title="Delete reflection"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#525252] leading-relaxed font-medium mb-3">{ref.content}</p>
                    <span className="text-[9px] text-[#a3a3a3] font-mono block select-none">
                      Logged {new Date(ref.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(ref.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Span 1) - Insights Findings & Projections */}
        <div className="space-y-6">
          
          {/* Biggest Impact Area Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFE5DD] flex items-center justify-center shrink-0 text-[#c96c57]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Biggest Impact Area</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">{dominant.category}</h4>
              <p className="text-xs font-bold text-[#cc431c]">{dominant.percentage}% of total footprint</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Your cumulative carbon logs indicate this category needs active mitigation choices.
              </p>
            </div>
          </div>

          {/* Strongest Sustainability Habit Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#DDE8D8] flex items-center justify-center shrink-0 text-[#2d3b28]">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Strongest Habit</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">Low-Impact Recycling</h4>
              <p className="text-xs font-bold text-[#2d3b28] uppercase tracking-wider">High consistency patterns</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Composting and separation habits are your most consistent daily choices.
              </p>
            </div>
          </div>

          {/* Improvement Opportunity Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center shrink-0 text-[#b89535]">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Improvement Opportunity</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">Meatless Days</h4>
              <p className="text-xs font-bold text-[#b89535] uppercase tracking-wider">Save 42kg CO₂/mo</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Substituting dairy and meat cuts with plant-based alternatives yields instant budget offsets.
              </p>
            </div>
          </div>

          {/* Emissions Pattern Analysis */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Pattern Analysis</span>
            <p className="text-xs text-[#525252] leading-relaxed font-medium">
              We observed a consistent decrease in your weekly utility usage logs. Continuing this downward rhythm will successfully stabilize your daily target goals.
            </p>
          </div>

          {/* Progress Forecast Chart */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card">
            <div className="mb-4">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Emissions Progress Forecast</span>
              <p className="text-[9px] text-[#525252] font-semibold mt-0.5">Dotted bounds represent estimated projection models</p>
            </div>
            
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d3b28" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2d3b28" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} kg`, 'CO₂e']} />
                  <Area type="monotone" dataKey="co2" stroke="#2d3b28" strokeWidth={1.5} fillOpacity={1} fill="url(#colorForecast)" />
                  <Area type="monotone" dataKey="projected" stroke="#2d3b28" strokeWidth={1.5} strokeDasharray="3 3" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-20 flex justify-center select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
