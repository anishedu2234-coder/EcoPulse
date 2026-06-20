import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

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
  const user = userString ? JSON.parse(userString) : null;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

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
  const today = new Date();
  const todayStr = today.toDateString();

  const todayActivities = activities.filter(
    (act) => new Date(act.timestamp).toDateString() === todayStr
  );

  const todayTotal = Math.round(todayActivities.reduce((sum, act) => sum + act.co2e, 0) * 10) / 10;
  const budgetLeft = Math.max(0, dailyBaseline - todayTotal);
  const budgetPercent = Math.min(100, Math.round((todayTotal / dailyBaseline) * 100));

  // Value -> Meaning -> Context Calculations
  const isOverBudget = todayTotal > dailyBaseline;
  const dailyDiffPct = dailyBaseline > 0
    ? Math.round((Math.abs(dailyBaseline - todayTotal) / dailyBaseline) * 100)
    : 0;

  // Largest emission source today
  const getLargestSource = () => {
    if (todayActivities.length === 0) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const weeklyActs = activities.filter(act => new Date(act.timestamp) >= lastWeek);
      if (weeklyActs.length === 0) return { category: 'None', val: 0 };

      const sums: Record<string, number> = {};
      weeklyActs.forEach(a => { sums[a.category] = (sums[a.category] || 0) + a.co2e; });
      const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
      return { category: sorted[0][0], val: Math.round(sorted[0][1] * 10) / 10 };
    }
    const sums: Record<string, number> = {};
    todayActivities.forEach(a => { sums[a.category] = (sums[a.category] || 0) + a.co2e; });
    const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return { category: sorted[0][0], val: Math.round(sorted[0][1] * 10) / 10 };
  };
  const largestSource = getLargestSource();

  // Streak calculation (days logged in a row)
  const getStreak = () => {
    const loggedDates = new Set(activities.map(a => new Date(a.timestamp).toDateString()));
    let streak = 0;
    let curr = new Date();

    if (loggedDates.has(curr.toDateString())) {
      streak++;
      while (true) {
        curr.setDate(curr.getDate() - 1);
        if (loggedDates.has(curr.toDateString())) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (loggedDates.has(yesterday.toDateString())) {
        streak++;
        curr = yesterday;
        while (true) {
          curr.setDate(curr.getDate() - 1);
          if (loggedDates.has(curr.toDateString())) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  };
  const streak = getStreak();

  // Best Habit (Lowest avg emission category in last 30 days)
  const getBestHabit = () => {
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
  };
  const bestHabit = getBestHabit();

  // Dynamic Eco Score Calculation
  const calculateEcoScore = () => {
    let baseScore = 65;
    activities.forEach(act => {
      if (act.co2e <= 12) baseScore += 1.5;
      else if (act.co2e >= 60) baseScore -= 1;
    });
    challenges.forEach(g => {
      if (g.status === 'completed') baseScore += 5;
    });
    return Math.max(10, Math.min(99, Math.round(baseScore)));
  };
  const ecoScore = calculateEcoScore();

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
  const getWeeklyTrendData = () => {
    const trend = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = weekdays[d.getDay()];
      const dStr = d.toDateString();
      const dayTotal = activities
        .filter(act => new Date(act.timestamp).toDateString() === dStr)
        .reduce((sum, act) => sum + act.co2e, 0);

      trend.push({
        day: label,
        co2: Math.round(dayTotal * 10) / 10
      });
    }
    return trend;
  };
  const weeklyData = getWeeklyTrendData();

  // Calculate Weekly Savings Trend
  const getWeeklySavings = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyTotal = activities
      .filter(act => new Date(act.timestamp) >= lastWeek)
      .reduce((sum, act) => sum + act.co2e, 0);
    const weeklyBudget = dailyBaseline * 7;
    const weeklySaved = Math.round((weeklyBudget - weeklyTotal) * 10) / 10;
    const weeklySavedPct = weeklyBudget > 0 ? Math.round((weeklySaved / weeklyBudget) * 100) : 0;
    return { co2: weeklySaved, pct: weeklySavedPct };
  };
  const weeklySavings = getWeeklySavings();

  // Joined/active challenges
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  // Cumulative total footprint
  const cumulativeFootprint = Math.round(activities.reduce((sum, act) => sum + act.co2e, 0));

  // Smart Contextual Assistant Recommendation System (No AI)
  const getSmartRecommendation = () => {
    // 1. Re-engagement suggestion
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

    // 2. High transport emissions
    if (largestSource.category === 'Transport' && largestSource.val > dailyBaseline * 0.4) {
      return {
        title: 'Lighten Your Journeys',
        message: 'Transport is currently your largest footprint area. Swapping just two car trips for public transit or walking makes a massive difference.',
        icon: 'directions_bike',
        actionLabel: 'Explore Travel Challenges',
        actionPath: '/challenges'
      };
    }

    // 3. High food emissions
    if (largestSource.category === 'Food' && largestSource.val > dailyBaseline * 0.3) {
      return {
        title: 'Try a Green Culinary Day',
        message: 'Food represents a significant share of today\'s footprint. Enjoying plant-based or zero-waste organic meals is a delicious way to offset this.',
        icon: 'local_pizza',
        actionLabel: 'Explore Food Intentions',
        actionPath: '/challenges'
      };
    }

    // 4. Streak continuation encouragement
    if (streak >= 3) {
      return {
        title: 'Superb Consistency!',
        message: `You are on a ${streak}-day logging streak! Consistent tracking builds the habits that rewrite our environmental future.`,
        icon: 'local_fire_department',
        actionLabel: 'Keep the Streak Going',
        actionPath: '/log'
      };
    }

    // 5. General encouragement
    return {
      title: 'Maintain Your Low-Impact Pace',
      message: 'Your footprint is well within your budget boundaries today. Small, mindful acts are creating a quiet, powerful ripple effect.',
      icon: 'stars',
      actionLabel: 'View reflections',
      actionPath: '/insights'
    };
  };
  const recommendation = getSmartRecommendation();

  // Recent improvements logic
  const getRecentImprovements = () => {
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
  };
  const improvements = getRecentImprovements();

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
              <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-white rounded-full border border-neutral-100 shadow-sm relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="#f6f5f3" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke={isOverBudget ? '#FFE5DD' : '#2d3b28'}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1.0, todayTotal / dailyBaseline))}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#a3a3a3]">{budgetPercent}% used</span>
                  <span className="text-lg font-display font-extrabold text-[#1a1a1a]">{budgetLeft}</span>
                  <span className="text-[8px] text-[#a3a3a3] font-bold">kg CO₂ Left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Recommendation Assistant (No AI) */}
          <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm flex items-start gap-4 hover-scale-card transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#FFF8F2] flex items-center justify-center shrink-0 text-[#2d3b28]">
              <span className="material-symbols-outlined text-[24px]">{recommendation.icon}</span>
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Companion Recommendation</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">{recommendation.title}</h4>
              <p className="text-sm text-[#525252] leading-relaxed font-medium pr-4">{recommendation.message}</p>
              <button
                onClick={() => navigate(recommendation.actionPath)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2d3b28] hover:underline"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

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
          <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-8 border-b border-neutral-50 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Recent Activity</h3>
                <p className="text-xs text-[#a3a3a3] font-medium mt-0.5">Chronology of your logged footprint moments</p>
              </div>
              <button
                onClick={() => navigate('/log')}
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

        </div>

        {/* Right Column (Span 1) - Secondary Metrics, Habit and Snapshots */}
        <div className="space-y-6">

          {/* Weekly Performance Summary Card */}
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

          {/* Recent Improvements & Achievements Highlights */}
          <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm hover-scale-card">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Recent Improvements</span>
            <div className="space-y-3.5">
              {improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${imp.color} mt-0.5`}>{imp.icon}</span>
                  <p className="text-xs font-semibold text-[#525252] leading-relaxed">{imp.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Largest Emission Source card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-start gap-4 hover-scale-card">
            <div className="w-10 h-10 rounded-full bg-[#FFE5DD] flex items-center justify-center shrink-0 text-[#cc431c]">
              <span className="material-symbols-outlined text-[20px]">factory</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Largest Source</span>
              <h4 className="text-xl font-display font-extrabold text-[#1a1a1a]">{largestSource.category}</h4>
              <p className="text-xs font-bold text-[#cc431c]">{largestSource.val} kg CO₂ logged</p>
              <p className="text-[11px] text-[#525252] leading-normal font-medium pt-1">
                {largestSource.val > 0
                  ? `Represents your highest carbon footprint contribution in recorded windows.`
                  : "No carbon sources logged recently. Keep maintaining low emissions."
                }
              </p>
            </div>
          </div>

          {/* Best Sustainable Habit card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-start gap-4 hover-scale-card">
            <div className="w-10 h-10 rounded-full bg-[#DDE8D8] flex items-center justify-center shrink-0 text-[#2d3b28]">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Best Sustainable Habit</span>
              <h4 className="text-xl font-display font-extrabold text-[#1a1a1a]">{bestHabit}</h4>
              <p className="text-xs font-bold text-[#2d3b28] uppercase tracking-wider">Lowest emission average</p>
              <p className="text-[11px] text-[#525252] leading-normal font-medium pt-1">
                You log extremely light environmental impact values under this category.
              </p>
            </div>
          </div>

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
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-50">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Intentions In Progress</span>
              <button
                onClick={() => navigate('/challenges')}
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
                  onClick={() => navigate('/challenges')}
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

        </div>

      </div>
    </main>
  );
};
