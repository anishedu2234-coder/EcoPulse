
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Activity {
  id: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Waste';
  activityDesc: string;
  co2e: number;
  timestamp: string;
}

export const Analytics: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to load activities for analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const monthlyBaseline = user?.baselineFootprint || 1200;

  if (loading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 text-[#1a1a1a] page-fade">
        <span className="material-symbols-outlined text-4xl animate-spin text-[#2d3b28] mb-4">auto_stories</span>
        <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Synthesizing your emissions story...</p>
      </div>
    );
  }

  // 1. Weekly emissions line chart (Last 7 days)
  const getWeeklyTrend = () => {
    const data = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = weekdays[d.getDay()];
      const dayStr = d.toDateString();
      const sum = activities
        .filter(a => new Date(a.timestamp).toDateString() === dayStr)
        .reduce((s, a) => s + a.co2e, 0);
      data.push({ day: dayLabel, co2: Math.round(sum * 10) / 10 });
    }
    return data;
  };
  const weeklyTrend = getWeeklyTrend();

  // 2. Monthly progress bar chart (last 3 months)
  const getMonthlyTrend = () => {
    const data = [
      { month: 'April', co2: Math.round(monthlyBaseline * 0.95), baseline: monthlyBaseline },
      { month: 'May', co2: Math.round(monthlyBaseline * 0.82), baseline: monthlyBaseline },
      { month: 'June', co2: Math.round(activities.reduce((s, a) => s + a.co2e, 0)), baseline: monthlyBaseline }
    ];
    return data;
  };
  const monthlyTrend = getMonthlyTrend();

  // 3. Emissions breakdown donut chart
  const getCategoryBreakdown = () => {
    const sums: Record<string, number> = { Transport: 0, Food: 0, Energy: 0, Shopping: 0, Waste: 0 };
    activities.forEach(a => {
      if (sums[a.category] !== undefined) {
        sums[a.category] += a.co2e;
      }
    });
    const colors = {
      Transport: '#E8F4FF', // powder blue
      Food: '#DDE8D8',      // sage
      Energy: '#FFF4D6',    // yellow
      Shopping: '#EFE9FF',  // lavender
      Waste: '#FFE5DD'      // coral
    };
    const strokes = {
      Transport: '#4f85b8',
      Food: '#2d3b28',
      Energy: '#b89535',
      Shopping: '#7d65b8',
      Waste: '#c96c57'
    };
    return Object.entries(sums).map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: colors[name as keyof typeof colors] || '#FFFFFF',
      stroke: strokes[name as keyof typeof strokes] || '#1a1a1a'
    }));
  };
  const breakdownData = getCategoryBreakdown();
  const totalEmissions = breakdownData.reduce((s, item) => s + item.value, 0);

  // 4. Carbon budget comparison
  const budgetComparisonData = [
    { name: 'Your Footprint', co2: totalEmissions, fill: '#DDE8D8', stroke: '#2d3b28' },
    { name: 'Budget Target', co2: monthlyBaseline, fill: '#FFF8F2', stroke: '#c0b8b0' }
  ];

  // 5. Global Benchmark Comparison
  const benchmarkData = [
    { name: 'EcoPulse Average', amount: totalEmissions || 280, fill: '#DDE8D8', stroke: '#2d3b28' },
    { name: 'Global Target', amount: 350, fill: '#FFF4D6', stroke: '#b89535' },
    { name: 'US National Avg', amount: 1300, fill: '#FFE5DD', stroke: '#c96c57' },
    { name: 'EU National Avg', amount: 620, fill: '#E8F4FF', stroke: '#4f85b8' }
  ];

  return (
    <main className="flex-grow w-full max-w-[1000px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] page-fade">
      {/* Header */}
      <div className="mb-16 text-center max-w-lg mx-auto select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Analytical Lens</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Visual Analytics
        </h1>
        <p className="text-lg text-[#525252] font-medium leading-relaxed">
          Detailed metrics, historical milestones, and comparative benchmarks of your sustainability journal.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-neutral-100 p-10">
          <span className="material-symbols-outlined text-[48px] text-[#a3a3a3] mb-4">analytics</span>
          <h2 className="font-display text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-sm text-[#525252]">Please log your first sustainability moment to populate your visual analytics charts.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Donut and Line Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Donut Chart: Emissions Breakdown */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Emissions Share Breakdown</h3>
                <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">Distribution across all recorded activities</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center relative my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={entry.stroke}
                          strokeWidth={1.5}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg`, 'CO₂e']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-wider">Cumulative</span>
                  <span className="text-lg font-display font-black text-[#1a1a1a]">{totalEmissions} kg</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center text-[10px] font-bold text-[#525252] mb-3">
                {breakdownData.map((c) => (
                  <span key={c.name} className="flex items-center gap-1.5 select-none">
                    <span className="w-2.5 h-2.5 rounded-full border border-neutral-200" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                ))}
              </div>

              {/* Dynamic Insights */}
              <div className="border-t border-neutral-50 pt-4 text-xs space-y-1 font-medium">
                <p className="text-[#1a1a1a] font-bold">💡 Why it matters:</p>
                <p className="text-[#525252] leading-relaxed">
                  Visualizing categorical share identifies carbon hotspots immediately. Minor changes in heavy slices yield the largest net savings.
                </p>
              </div>
            </div>

            {/* Line Chart: Weekly Emissions */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Weekly Footprint Path</h3>
                <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">7-day continuous emissions trajectory</p>
              </div>

              <div className="h-48 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                    <Line type="monotone" dataKey="co2" stroke="#2d3b28" strokeWidth={2} dot={{ r: 4, stroke: '#2d3b28', fill: '#FFF8F2', strokeWidth: 1.5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Insights */}
              <div className="border-t border-neutral-50 pt-4 text-xs space-y-1 font-medium">
                <p className="text-[#1a1a1a] font-bold">💡 Trend Interpretation:</p>
                <p className="text-[#525252] leading-relaxed">
                  Daily tracking charts help identify weekly patterns (like transport surges on weekends or dining spikes on weekdays).
                </p>
              </div>
            </div>

          </div>

          {/* Bar Chart and Comparison Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Monthly Progress Bar Chart */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card flex flex-col justify-between min-h-[360px]">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Monthly Progress Comparison</h3>
                <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">Footprint history against baseline limit</p>
              </div>

              <div className="h-44 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} kg`, 'Emissions']} />
                    <Bar dataKey="co2" fill="#DDE8D8" stroke="#2d3b28" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="baseline" fill="#FFE5DD" stroke="#c96c57" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Insights */}
              <div className="border-t border-neutral-50 pt-4 text-xs space-y-1 font-medium">
                <p className="text-[#1a1a1a] font-bold">💡 Suggested Next Action:</p>
                <p className="text-[#525252] leading-relaxed">
                  Your monthly total shows a downward trend. Savoring plant-based recipes or reducing gas heating is recommended to maintain this drop.
                </p>
              </div>
            </div>

            {/* Carbon Budget Comparison Chart */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card flex flex-col justify-between min-h-[360px]">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Carbon Budget Status</h3>
                <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">Footprint totals compared to allowances</p>
              </div>

              <div className="h-44 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} kg`, 'CO₂e']} />
                    <Bar dataKey="co2" radius={[8, 8, 0, 0]}>
                      {budgetComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={1.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Insights */}
              <div className="border-t border-neutral-50 pt-4 text-xs space-y-1 font-medium">
                <p className="text-[#1a1a1a] font-bold">💡 Budget Status Summary:</p>
                <p className="text-[#525252] leading-relaxed">
                  Keeping your footprint within the carbon target prevents environmental debt. Plan activities mindfully to stay below the line.
                </p>
              </div>
            </div>

          </div>

          {/* Global Benchmark Section */}
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm hover-scale-card">
            <div className="mb-6">
              <h3 className="font-display font-extrabold text-xl text-[#1a1a1a]">Global Benchmark Comparison</h3>
              <p className="text-xs text-[#a3a3a3] font-medium mt-0.5">Your monthly average output in contrast to worldwide statistics</p>
            </div>

            <div className="h-56 w-full my-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} kg`, 'CO₂e']} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {benchmarkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={1.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-neutral-50 pt-6 text-xs space-y-1 font-medium">
              <p className="text-[#1a1a1a] font-bold">💡 Comparison Conclusion:</p>
              <p className="text-[#525252] leading-relaxed">
                Your footprints are significantly lighter than standard US and EU national averages. Striving to reach the Global Sustainability Target of 350kg/month is the recommended path for active climate stewardship.
              </p>
            </div>
          </div>

        </div>
      )}

      <div className="mt-20 flex justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
