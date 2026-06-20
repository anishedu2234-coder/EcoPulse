import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastItem {
  month: string;
  co2: number | null;
  projected: number | null;
}

interface ForecastChartProps {
  forecastData: ForecastItem[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastData,
}) => {
  return (
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
  );
};
