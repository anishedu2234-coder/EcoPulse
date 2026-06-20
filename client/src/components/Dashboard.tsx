import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { BudgetGauge } from './dashboard/BudgetGauge';
import { CompanionCard } from './dashboard/CompanionCard';
import { StatCard } from './dashboard/StatCard';
import { ActivityTimeline } from './dashboard/ActivityTimeline';
import { SavingsProgress } from './dashboard/SavingsProgress';
import { ImprovementsList } from './dashboard/ImprovementsList';
import { IntentionProgressList } from './dashboard/IntentionProgressList';

interface Activity {
  id: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Waste';
  activityDesc: string;
  co2e: number;
  timestamp: string;
}

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

export const Dashboard: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Animated counters
  const [animatedToday, setAnimatedToday] = useState(0);
  const [animatedEcoScore, setAnimatedEcoScore] = useState(0);

  const userString = localStorage.getItem('user');
  const user = useMemo(() => (userString ? JSON.parse(userString) : null), [userString]);
  const firstName = useMemo(() => (user?.name ? user.name.split(' ')[0] : 'Explorer'), [user]);

  const monthlyBaseline = user?.baselineFootprint || 1200;
  const dailyBaseline = Math.round(monthlyBaseline / 30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, challengesRes] = await Promise.all([
          api.get('/activities'),
          api.get('/challenges')
        ]);
        setActivities(activitiesRes.data);
        setChallenges(challengesRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Today's Date Metrics
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toDateString(), [today]);

  const todayActivities = useMemo(() => {
    return activities.filter((act) => new Date(act.timestamp).toDateString() === todayStr);
  }, [activities, todayStr]);

  const todayTotal = useMemo(() => {
    return Math.round(todayActivities.reduce((sum, act) => sum + act.co2e, 0) * 10) / 10;
  }, [todayActivities]);

  const budgetLeft = useMemo(() => Math.max(0, dailyBaseline - todayTotal), [dailyBaseline, todayTotal]);
  const budgetPercent = useMemo(() => {
    return dailyBaseline > 0 ? Math.min(100, Math.round((todayTotal / dailyBaseline) * 100)) : 0;
  }, [todayTotal, dailyBaseline]);

  const isOverBudget = todayTotal > dailyBaseline;
  const dailyDiffPct = useMemo(() => {
    return dailyBaseline > 0 ? Math.round((Math.abs(dailyBaseline - todayTotal) / dailyBaseline) * 100) : 0;
  }, [dailyBaseline, todayTotal]);

  // Largest emission source today / last 7 days
  const largestSource = useMemo(() => {
    const sourceActs = todayActivities.length === 0
      ? activities.filter(act => {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return new Date(act.timestamp) >= lastWeek;
        })
      : todayActivities;

    if (sourceActs.length === 0) return { category: 'None', val: 0 };

    const sums: Record<string, number> = {};
    sourceActs.forEach(a => { sums[a.category] = (sums[a.category] || 0) + a.co2e; });
    const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return { category: sorted[0][0], val: Math.round(sorted[0][1] * 10) / 10 };
  }, [activities, todayActivities]);

  // Streak calculation (days logged in a row)
  const streak = useMemo(() => {
    const loggedDates = new Set(activities.map(a => new Date(a.timestamp).toDateString()));
    let count = 0;
    let curr = new Date();

    if (loggedDates.has(curr.toDateString())) {
      count++;
      while (true) {
        curr.setDate(curr.getDate() - 1);
        if (loggedDates.has(curr.toDateString())) count++;
        else break;
      }
    } else {
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (loggedDates.has(yesterday.toDateString())) {
        count++;
        curr = yesterday;
        while (true) {
          curr.setDate(curr.getDate() - 1);
          if (loggedDates.has(curr.toDateString())) count++;
          else break;
        }
      }
    }
    return count;
  }, [activities]);

  // Best Habit (Lowest avg emission category in last 30 days)
  const bestHabit = useMemo(() => {
    const counts: Record<string, { total: number; logs: number }> = {};
    activities.forEach(a => {
      if (!counts[a.category]) counts[a.category] = { total: 0, logs: 0 };
      counts[a.category].total += a.co2e;
      counts[a.category].logs += 1;
    });
    const averages = Object.entries(counts)
      .map(([cat, stat]) => ({ cat, avg: stat.total / stat.logs }))
      .sort((a, b) => a.avg - b.avg);

    if (averages.length === 0) return 'Conscious Planning';
    return averages[0].cat;
  }, [activities]);

  // Dynamic Eco Score Calculation
  const ecoScore = useMemo(() => {
    let baseScore = 65;
    activities.forEach(act => {
      if (act.co2e <= 12) baseScore += 1.5;
      else if (act.co2e >= 60) baseScore -= 1;
    });
    challenges.forEach(g => {
      if (g.status === 'completed') baseScore += 5;
    });
    return Math.max(10, Math.min(99, Math.round(baseScore)));
  }, [activities, challenges]);

  // Incremental count animations
  useEffect(() => {
    if (loading) return;
    const todayTimer = setTimeout(() => {
      if (animatedToday < todayTotal) {
        setAnimatedToday(prev => Math.min(todayTotal, Math.round((prev + todayTotal / 10) * 10) / 10));
      }
    }, 30);
    return () => clearTimeout(todayTimer);
  }, [animatedToday, todayTotal, loading]);

  useEffect(() => {
    if (loading) return;
    const scoreTimer = setTimeout(() => {
      if (animatedEcoScore < ecoScore) {
        setAnimatedEcoScore(prev => Math.min(ecoScore, prev + 1));
      }
    }, 15);
    return () => clearTimeout(scoreTimer);
  }, [animatedEcoScore, ecoScore, loading]);

  // Last 7 days chart data
  const weeklyData = useMemo(() => {
    const trend = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = weekdays[d.getDay()];
      const dStr = d.toDateString();
      const daySum = activities
        .filter(act => new Date(act.timestamp).toDateString() === dStr)
        .reduce((sum, act) => sum + act.co2e, 0);

      trend.push({
        day: label,
        co2: Math.round(daySum * 10) / 10
      });
    }
    return trend;
  }, [activities]);

  // Calculate Weekly Savings Trend
  const weeklySavings = useMemo(() => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyTotal = activities
      .filter(act => new Date(act.timestamp) >= lastWeek)
      .reduce((sum, act) => sum + act.co2e, 0);
    const weeklyBudget = dailyBaseline * 7;
    const weeklySaved = Math.round((weeklyBudget - weeklyTotal) * 10) / 10;
    const weeklySavedPct = weeklyBudget > 0 ? Math.round((weeklySaved / weeklyBudget) * 100) : 0;
    return { co2: weeklySaved, pct: weeklySavedPct };
  }, [activities, dailyBaseline]);

  // Joined/active challenges
  const activeChallenges = useMemo(() => challenges.filter(c => c.status === 'active'), [challenges]);
  const completedChallenges = useMemo(() => challenges.filter(c => c.status === 'completed'), [challenges]);

  // Cumulative total footprint
  const cumulativeFootprint = useMemo(() => Math.round(activities.reduce((sum, act) => sum + act.co2e, 0)), [activities]);

  // Smart Contextual Assistant Recommendation System (No AI)
  const recommendation = useMemo(() => {
    if (activities.length === 0) {
      return {
        title: 'Begin Your Sustainable Story',
        message: 'Log your first sustainable decision (like a meatless meal or a bike trip) to discover your real-time carbon budget offsets.',
        icon: 'menu_book',
        actionLabel: 'Log Your First Moment',
        actionPath: '/log'
      };
    }

    const lastLogDate = new Date(activities[0].timestamp);
    const daysSinceLastLog = Math.round((today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastLog >= 3) {
      return {
        title: 'Reconnect With Your Impact',
        message: `It has been ${daysSinceLastLog} days since your last log. Keeping a regular journal builds lasting sustainable patterns.`,
        icon: 'notifications_active',
        actionLabel: 'Log Today\'s Activity',
        actionPath: '/log'
      };
    }

    if (largestSource.category === 'Transport' && largestSource.val > dailyBaseline * 0.4) {
      return {
        title: 'Lighten Your Journeys',
        message: 'Transport is currently your largest footprint area. Swapping just two car trips for public transit or walking makes a massive difference.',
        icon: 'directions_bike',
        actionLabel: 'Explore Travel Challenges',
        actionPath: '/challenges'
      };
    }

    if (largestSource.category === 'Food' && largestSource.val > dailyBaseline * 0.3) {
      return {
        title: 'Try a Green Culinary Day',
        message: 'Food represents a significant share of today\'s footprint. Enjoying plant-based or zero-waste organic meals is a delicious way to offset this.',
        icon: 'local_pizza',
        actionLabel: 'Explore Food Intentions',
        actionPath: '/challenges'
      };
    }

    if (streak >= 3) {
      return {
        title: 'Superb Consistency!',
        message: `You are on a ${streak}-day logging streak! Consistent tracking builds the habits that rewrite our environmental future.`,
        icon: 'local_fire_department',
        actionLabel: 'Keep the Streak Going',
        actionPath: '/log'
      };
    }

    return {
      title: 'Maintain Your Low-Impact Pace',
      message: 'Your footprint is well within your budget boundaries today. Small, mindful acts are creating a quiet, powerful ripple effect.',
      icon: 'stars',
      actionLabel: 'View reflections',
      actionPath: '/insights'
    };
  }, [activities, largestSource, streak, today, dailyBaseline]);

  // Recent improvements logic
  const improvements = useMemo(() => {
    const list = [];
    if (weeklySavings.co2 > 0) {
      list.push({ text: `Saved ${weeklySavings.co2} kg CO₂ this week compared to baseline`, icon: 'trending_down', color: 'text-[#2d3b28]' });
    }
    if (streak >= 2) {
      list.push({ text: `Maintained a ${streak}-day active sustainable streak`, icon: 'local_fire_department', color: 'text-[#cc431c]' });
    }
    if (completedChallenges.length > 0) {
      list.push({ text: `Successfully fulfilled ${completedChallenges.length} sustainable intentions`, icon: 'military_tech', color: 'text-[#7d65b8]' });
    }
    if (list.length === 0) {
      list.push({ text: 'Logged active reflections and consumption choices', icon: 'check_circle', color: 'text-[#2d3b28]' });
    }
    return list;
  }, [weeklySavings, streak, completedChallenges]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-32 text-[#1a1a1a] page-fade">
        <span className="material-symbols-outlined text-[40px] animate-pulse mb-6 text-[#2d3b28]">auto_stories</span>
        <p className="font-sans font-medium text-sm tracking-wider uppercase text-[#a3a3a3]">Opening your Climate Command Center...</p>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 font-sans text-[#1a1a1a] relative page-fade">
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#DDE8D8] rounded-full mix-blend-multiply filter blur-[100px] opacity-25 pointer-events-none"></div>

      {/* Header */}
      <div className="mb-12 text-center max-w-lg mx-auto select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-3">Climate Command Center</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[#1a1a1a] tracking-tight mb-3">
          Good to see you, {firstName}.
        </h1>
        <p className="text-[16px] md:text-lg text-[#525252] font-medium leading-relaxed">
          Every action is a sentence. Every day is a page. Here is your story so far.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column (Span 2) - Core Performance Data */}
        <div className="lg:col-span-2 space-y-6">

          {/* Daily Pulse Card Redesign */}
          <div className="bg-[#FFF8F2] rounded-[28px] p-8 md:p-10 border border-[rgba(0,0,0,0.04)] shadow-[0_12px_48px_rgba(0,0,0,0.02)] relative overflow-hidden group hover-scale-card">
            <div className="absolute top-0 right-0 w-full h-full opacity-35 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#DDE8D8] rounded-full filter blur-[70px] opacity-40 mix-blend-multiply pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-3.5">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Daily Pulse</span>

                {/* Metric Value */}
                <h3 className="text-3xl md:text-4xl font-display font-extrabold text-[#1a1a1a] tracking-tight">
                  {animatedToday} kg CO₂e
                </h3>

                {/* Meaning */}
                <p className="font-display font-bold text-lg text-[#2d3b28] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]">
                    {!isOverBudget ? 'check_circle' : 'warning'}
                  </span>
                  {!isOverBudget
                    ? `${dailyDiffPct}% below daily budget limit`
                    : `${dailyDiffPct}% above daily budget limit`
                  }
                </p>

                {/* Contextual Stats row */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold py-1">
                  <span className="inline-flex items-center gap-1 bg-white/60 border border-neutral-100 rounded-full px-3 py-1 shadow-sm text-[#1a1a1a]">
                    <span className="material-symbols-outlined text-sm text-[#cc431c]">local_fire_department</span>
                    Streak: {streak} days
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/60 border border-neutral-100 rounded-full px-3 py-1 shadow-sm text-[#1a1a1a]">
                    <span className="material-symbols-outlined text-sm text-[#4f85b8]">factory</span>
                    Top Source: {largestSource.category}
                  </span>
                </div>

                {/* Context & Explanation */}
                <p className="text-sm text-[#525252] leading-relaxed font-medium">
                  {todayActivities.length === 0
                    ? "Your page is blank today. Log a footprint preset below to calculate your real-time budget status."
                    : !isOverBudget
                      ? `Good stewardship today. Keeping ${largestSource.category} emissions low is helping protect your daily carbon limits.`
                      : `Your emissions are heavier today due to higher consumption in ${largestSource.category}. Swapping to low-impact habits is recommended.`
                  }
                </p>
              </div>

              {/* Redesigned Budget Gauge with Progress Ring */}
              <BudgetGauge
                isOverBudget={isOverBudget}
                todayTotal={todayTotal}
                dailyBaseline={dailyBaseline}
                budgetPercent={budgetPercent}
                budgetLeft={budgetLeft}
              />
            </div>
          </div>

          {/* Smart Recommendation Assistant */}
          <CompanionCard
            recommendation={recommendation}
            onActionClick={(path) => navigate(path)}
          />

          {/* Eco Score & Weekly Trend Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Current Eco Score Card */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex items-center justify-between group hover-scale-card">
              <div className="space-y-2.5 flex-1 pr-4">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Current Eco Score</span>
                <h4 className="text-3xl font-display font-extrabold text-[#1a1a1a]">{animatedEcoScore} <span className="text-sm text-[#a3a3a3] font-normal">/100</span></h4>
                <p className="text-xs font-bold text-[#2d3b28] uppercase tracking-wider">
                  {ecoScore >= 75 ? '🌱 Excellent Stewardship' : ecoScore >= 55 ? '🌤️ Active Journey' : '🍂 Expanding Awareness'}
                </p>
                <p className="text-[11px] text-[#525252] leading-normal font-medium mt-1">
                  Reflected across your low-carbon daily logs and intentional habit-building.
                </p>
              </div>

              {/* Visual Ring */}
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center relative select-none">
                <svg className="w-18 h-18 transform -rotate-90">
                  <circle cx="36" cy="36" r="32" stroke="#f6f5f3" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="#2d3b28"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - ecoScore / 100)}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-sm font-display font-black text-[#1a1a1a]">{ecoScore}%</div>
              </div>
            </div>

            {/* Weekly Carbon Trend Graph Card */}
            <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] group hover-scale-card flex flex-col justify-between h-[180px]">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Weekly Carbon Trend</span>
                <span className="text-[10px] font-bold text-[#525252] tracking-wide block mt-1">7-Day Emissions History</span>
              </div>

              <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d3b28" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2d3b28" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="co2" stroke="#2d3b28" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCo2)" />
                    <Tooltip cursor={false} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white px-2 py-1 border border-neutral-100 rounded-[8px] text-[10px] font-bold shadow-sm text-[#1a1a1a]">
                            {payload[0].value} kg
                          </div>
                        );
                      }
                      return null;
                    }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Recent Activity Timeline */}
          <ActivityTimeline
            activities={activities}
            onLogClick={() => navigate('/log')}
          />

        </div>

        {/* Right Column (Span 1) - Secondary Metrics, Habit and Snapshots */}
        <div className="space-y-6">

          {/* Weekly Performance Summary Card */}
          <SavingsProgress weeklySavings={weeklySavings} />

          {/* Recent Improvements & Achievements Highlights */}
          <ImprovementsList improvements={improvements} />

          {/* Largest Emission Source card */}
          <StatCard
            title="Largest Source"
            value={largestSource.category}
            subValue={`${largestSource.val} kg CO₂ logged`}
            subValueColor="text-[#cc431c]"
            icon="factory"
            iconBg="bg-[#FFE5DD]"
            iconColor="text-[#cc431c]"
            description={
              largestSource.val > 0
                ? "Represents your highest carbon footprint contribution in recorded windows."
                : "No carbon sources logged recently. Keep maintaining low emissions."
            }
          />

          {/* Best Sustainable Habit card */}
          <StatCard
            title="Best Sustainable Habit"
            value={bestHabit}
            subValue="Lowest emission average"
            subValueColor="text-[#2d3b28] uppercase tracking-wider"
            icon="eco"
            iconBg="bg-[#DDE8D8]"
            iconColor="text-[#2d3b28]"
            description="You log extremely light environmental impact values under this category."
          />

          {/* Personal Impact Summary section */}
          <div className="bg-[#FFF8F2] rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between hover-scale-card">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Personal Impact Summary</span>
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-[#a3a3a3] font-bold block">Total Logged Footprint</span>
                <span className="text-2xl font-display font-extrabold text-[#1a1a1a]">{cumulativeFootprint} kg</span>
                <span className="text-xs text-[#525252] font-semibold block mt-0.5">Across {activities.length} moments</span>
              </div>
              <div className="border-t border-[rgba(0,0,0,0.05)] pt-3.5">
                <span className="text-[10px] text-[#a3a3a3] font-bold block">Environmental Rhythm</span>
                <span className="text-[13px] font-bold text-[#1a1a1a] block mt-0.5">
                  {activities.length > 0 ? `${(activities.length / 7).toFixed(1)} logs / day average` : '0 logs'}
                </span>
                <span className="text-[10px] text-[#525252] leading-normal block mt-1">Consistency maps your footprint patterns more accurately.</span>
              </div>
            </div>
          </div>

          {/* Challenge Progress snapshot */}
          <IntentionProgressList
            activeChallenges={activeChallenges}
            onBrowseClick={() => navigate('/challenges')}
          />

        </div>

      </div>
    </main>
  );
};
