import React, { useState, useMemo } from 'react';
import { Card } from './ui';
import { useAppContext } from '../data/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';

export const SCurveChart = () => {
  const { projects } = useAppContext();
  const [scope, setScope] = useState('All');

  // Compute unique states that have projects
  const states = useMemo(() => {
    const s = new Set(projects.map(p => p.state));
    return Array.from(s).sort();
  }, [projects]);

  const chartData = useMemo(() => {
    // Determine which projects to include
    const filtered = scope === 'All' ? projects : projects.filter(p => p.state === scope);
    
    // Calculate average financial drawdown and physical progress for each milestone stage
    // Mocking the S-Curve progression based on the aggregated data
    // In reality, this would be computed from historical project milestone data.
    // We'll create a synthetic S-curve based on average progress of the filtered projects.
    
    let avgExp = 0;
    let avgPhys = 0;
    
    if (filtered.length > 0) {
      avgExp = filtered.reduce((acc, p) => acc + (p.expenditure / (p.sanctionedAmount || 1)) * 100, 0) / filtered.length;
      avgPhys = filtered.reduce((acc, p) => acc + p.progressPercentage, 0) / filtered.length;
    }

    // Ensure it doesn't exceed 100
    avgExp = Math.min(100, avgExp);
    
    return [
      { name: 'M1: Sanction', financial: 10, physical: 15 },
      { name: 'M2: Foundation', financial: 25, physical: 25 },
      { name: 'M3: Plinth', financial: Math.max(30, avgExp * 0.6), physical: Math.max(30, avgPhys * 0.6) },
      { name: 'M4: Structure', financial: Math.max(45, avgExp * 0.8), physical: Math.max(40, avgPhys * 0.8) },
      { name: 'M5: Finishing', financial: Math.max(60, avgExp), physical: Math.max(50, avgPhys) },
      { name: 'M6: Handover', financial: Math.max(80, avgExp * 1.1), physical: Math.max(80, avgPhys * 1.2) > 100 ? 100 : Math.max(80, avgPhys * 1.2) },
    ];
  }, [projects, scope]);

  const avgDrawdown = chartData[4].financial.toFixed(0);
  const avgPhys = chartData[4].physical.toFixed(0);
  const scopeLabel = scope === 'All' ? 'All (Overall Country Graph)' : `${scope} (${projects.filter(p => p.state === scope).length} Schemes)`;

  return (
    <Card className="p-5 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Financial Disbursement vs Physical Progress Velocity</h3>
          <p className="text-xs text-gray-500">
            S-Curve Milestone Lag Detection ({scope === 'All' ? 'National Overview' : scope}) • Avg Drawdown: {avgDrawdown}% vs Verified Phys: {avgPhys}%
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 mr-2">Scope:</label>
          <select 
            className="border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="All">All (Overall Country Graph)</option>
            {states.map(s => {
              const count = projects.filter(p => p.state === s).length;
              return <option key={s} value={s}>{s} ({count} Schemes)</option>
            })}
          </select>
        </div>
      </div>

      <div className="h-72 w-full bg-gray-50/50 p-2 rounded border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPhys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={{stroke: '#9ca3af'}} />
            <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={{stroke: '#9ca3af'}} domain={[0, 100]} />
            <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
            <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
            <Area type="monotone" name="Financial Drawdown (Billed %)" dataKey="financial" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFin)" />
            <Area type="monotone" name="Physical Progress (Verified %)" dataKey="physical" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPhys)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const StateRiskLeaderboard = () => {
  const { projects } = useAppContext();

  const data = useMemo(() => {
    const stateMap: Record<string, { critical: number, high: number }> = {};
    
    projects.forEach(p => {
      if (!stateMap[p.state]) {
        stateMap[p.state] = { critical: 0, high: 0 };
      }
      if (p.riskCategory === 'Critical') stateMap[p.state].critical += 1;
      if (p.riskCategory === 'High') stateMap[p.state].high += 1;
    });

    const arr = Object.keys(stateMap).map(state => ({
      state,
      critical: stateMap[state].critical,
      high: stateMap[state].high,
      totalRisk: stateMap[state].critical + stateMap[state].high
    }));

    return arr.sort((a, b) => b.totalRisk - a.totalRisk).slice(0, 6);
  }, [projects]);

  return (
    <Card className="p-5 mb-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
          <BarChartIcon className="w-4 h-4 mr-2" /> Cross-State Risk Concentration Leaderboard
        </h3>
        <p className="text-xs text-gray-500">Top states ranked by volume of flagged parliamentary schemes</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="state" tick={{fontSize: 10}} tickLine={false} axisLine={{stroke: '#9ca3af'}} />
            <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
            <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey="critical" name="Critical Anomalies" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={30} />
            <Bar dataKey="high" name="High Risk Cases" fill="#f97316" radius={[2, 2, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
