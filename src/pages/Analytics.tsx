import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  Server, CheckCircle2, XOctagon, Wrench, ShieldAlert, CheckSquare, HeartPulse, Clock, ShieldCheck, Sparkles, FileText, Download 
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { machines, alerts, tickets, systemHealth, systemStats } = useSimulation();
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'quarter'>('month');

  // Mock Uptime & MTTR
  const uptimePct = 99.88;
  const mttrMinutes = 84;

  // Mini sparkline mock data for KPIs
  const kpiSparklineData = [
    { value: 40 }, { value: 45 }, { value: 38 }, { value: 52 }, { value: 48 }, { value: 60 }, { value: 55 }
  ];

  // 1. KPI Cards Config
  const kpis = [
    { title: 'Total Devices', value: systemStats.total, trend: 'Stable', pct: '0%', icon: Server, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Healthy Devices', value: systemStats.healthy, trend: 'Optimal', pct: '+2.4%', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
    { title: 'Critical Devices', value: systemStats.critical, trend: 'Attention', pct: '+1', icon: XOctagon, color: 'text-red-600 bg-red-50 border-red-200' },
    { title: 'Under Maintenance', value: systemStats.maintenanceDue, trend: 'Active', pct: '0%', icon: Wrench, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { title: 'Incidents Today', value: alerts.length, trend: 'Descending', pct: '-8%', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Resolved Incidents', value: alerts.filter(a => a.status === 'resolved').length, trend: 'Ascending', pct: '+14%', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Average Health Score', value: `${systemHealth}%`, trend: 'Standard', pct: '+0.5%', icon: HeartPulse, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'System Uptime', value: `${uptimePct}%`, trend: 'Nominal', pct: '+0.02%', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { title: 'Avg Resolution Time', value: `${mttrMinutes} Min`, trend: 'Improving', pct: '-12m', icon: Clock, color: 'text-violet-600 bg-violet-50 border-violet-200' }
  ];

  // 2. System Health Radial data
  const healthRadialData = [
    { name: 'System Health', value: systemHealth, fill: '#2563EB' }
  ];

  // 3. Device Distribution Pie data
  const deviceTypeCounts = machines.reduce((acc: any, cur) => {
    acc[cur.type] = (acc[cur.type] || 0) + 1;
    return acc;
  }, {});
  const distributionData = Object.keys(deviceTypeCounts).map(key => ({
    name: key,
    value: deviceTypeCounts[key]
  }));
  const COLORS = ['#2563EB', '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // 4. Device Health Trend line data (Last 24 Hours)
  const hourlyTrendData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    health: Math.max(88, Math.min(99, systemHealth + Math.sin(i * 0.4) * 3 - (i === 12 ? 4 : 0)))
  }));

  // 5. Anomaly Severity Bar data
  const anomalySeverityData = [
    { severity: 'Low', count: 18, fill: '#3b82f6' },
    { severity: 'Medium', count: 11, fill: '#6366f1' },
    { severity: 'High', count: 5, fill: '#f59e0b' },
    { severity: 'Critical', count: 2, fill: '#ef4444' },
  ];

  // 6. Heatmap Zones representation
  const zones = [
    { name: 'Zone A - CNC Line', status: 'Green', color: 'bg-green-500 shadow-green-100', text: 'text-green-700 bg-green-50 border-green-200' },
    { name: 'Zone B - Robotic Assemblers', status: 'Orange', color: 'bg-amber-500 shadow-amber-100', text: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'Zone C - heavy Compressors', status: 'Red', color: 'bg-red-500 shadow-red-100', text: 'text-red-700 bg-red-50 border-red-200' },
    { name: 'Zone D - Packer sorters', status: 'Green', color: 'bg-green-500 shadow-green-100', text: 'text-green-700 bg-green-50 border-green-200' },
  ];

  // 7. Maintenance analytics categorization
  const maintenanceData = [
    { category: 'Upcoming', hours: 45, fill: '#6366F1' },
    { category: 'Completed', hours: 120, fill: '#22C55E' },
    { category: 'Delayed', hours: 12, fill: '#F59E0B' },
    { category: 'Emergency', hours: 8, fill: '#EF4444' },
  ];

  // 8. Top Failing Devices leaderboard
  const topFailingDevices = [...machines]
    .filter(m => m.status !== 'healthy')
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5);

  const handleExport = (format: string) => {
    alert(`Exporting executive health analytics summary report to ${format}...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">Enterprise Operations Analytics</h1>
          <p className="text-slate-550 text-xs mt-1">Cross-facility efficiency index, system breakdowns, MTTR thresholds, and AI health modeling</p>
        </div>
        
        <div className="flex gap-2.5 items-center">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-600 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
          </select>

          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all"
          >
            <FileText size={13} /> Export PDF
          </button>
          <button 
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-600/10"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* TOP KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="glass-card p-3 flex flex-col justify-between col-span-1 xl:col-span-1 min-w-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase font-bold text-slate-400 truncate max-w-[80px]">{kpi.title}</span>
                <div className={`p-1 rounded-lg border ${kpi.color}`}>
                  <Icon size={12} />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-lg font-black text-slate-800 font-mono">{kpi.value}</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[8px] text-slate-400 font-semibold">{kpi.trend}</span>
                  <span className="text-[8px] text-green-600 font-bold font-mono">{kpi.pct}</span>
                </div>
              </div>
              
              {/* Mini Sparkline Chart */}
              <div className="h-6 w-full mt-2 opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpiSparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* MID SECTION: RADIAL GAUGE & HEALTH BREAKDOWNS + ZONE HEATMAPS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* System Health Radial Gauge */}
        <div className="glass-card p-5 flex flex-col justify-between items-center">
          <div className="w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Facility Health Index</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 mb-4">Mean operational score of active assemblies</p>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Concentric Circle Progress Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#2563EB" 
                strokeWidth="8" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - systemHealth / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-slate-800">{systemHealth}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">SYSTEM EFFICIENCY</span>
            </div>
          </div>

          {/* Health breakdowns */}
          <div className="w-full grid grid-cols-4 gap-2 text-center text-[9px] font-bold text-slate-500 border-t border-slate-100 pt-4 mt-2">
            <div>
              <p className="text-blue-600 font-bold font-mono">14 Nodes</p>
              <span>Excellent</span>
            </div>
            <div>
              <p className="text-green-600 font-bold font-mono">4 Nodes</p>
              <span>Good</span>
            </div>
            <div>
              <p className="text-amber-600 font-bold font-mono">1 Node</p>
              <span>Warning</span>
            </div>
            <div>
              <p className="text-red-650 font-bold font-mono">1 Node</p>
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Heatmap layout representation */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Operational Zones Heatmap</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 mb-4">Location based failure density map</p>
          </div>

          <div className="grid grid-cols-2 gap-3 h-48 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            {zones.map((zone) => (
              <div 
                key={zone.name}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all hover:shadow ${zone.text}`}
              >
                <span className="text-[9px] uppercase font-bold tracking-wider truncate max-w-[120px]">{zone.name}</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[8px] font-bold uppercase font-mono">STATUS: {zone.status}</span>
                  <span className={`w-3.5 h-3.5 rounded-full ${zone.color} shadow-md border border-white`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI INSIGHTS ADVISORY */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5"><Sparkles size={14} className="text-blue-600" /> AI Insights Advisor</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 mb-4">Real-time predictive telemetry insights</p>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-blue-700">COMPRESSOR FAIL PROBABILITY</span>
                <span className="text-blue-600 font-mono">87% CONFIDENCE</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-normal">
                "Heavy Compressor (DEV-004) stator coil vibration is rising steadily. Expected wear threshold violation within 48 hours."
              </p>
              <p className="text-[9px] text-slate-500 font-semibold italic">Recommendation: Initiate preventative cooling filter check.</p>
            </div>
            
            <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl flex justify-between items-center text-[9px] text-slate-500 font-bold">
              <span>EFFICIENCY ADVISORY</span>
              <span className="text-indigo-600 font-mono">+12% SPEED LINE B</span>
            </div>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: DISTRIBUTIONS, TRENDS, LEADERBOARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Device Health Trend (Line Chart) */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Plant Health Profile (24h)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTrendData}>
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                <YAxis domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', fontSize: '11px', color: '#1f2937' }} />
                <Line type="monotone" dataKey="health" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device distribution & Anomaly breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Machine Types & Severity Distribution</h3>
          <div className="grid grid-cols-2 gap-4 h-60">
            {/* Pie Chart */}
            <div className="h-full flex flex-col justify-between">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" outerRadius={55} paddingAngle={2} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-[8px] font-bold text-slate-500 select-none">
                {distributionData.slice(0, 4).map((entry, idx) => (
                  <span key={entry.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded" style={{ backgroundColor: COLORS[idx] }}></span>
                    {entry.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalySeverityData}>
                  <XAxis dataKey="severity" tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {anomalySeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Maintenance Analytics hours */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 font-bold">Maintenance Actions breakdown</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                <YAxis dataKey="category" type="category" tick={{ fill: '#64748b', fontSize: 9 }} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {maintenanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-1.5"><XOctagon size={14} className="text-red-500" /> Leaderboard: Top Failing Equipment</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2">Device</th>
                  <th className="py-2">Health</th>
                  <th className="py-2">Risk</th>
                  <th className="py-2">Downtime</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {topFailingDevices.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 font-bold text-slate-800">{m.name} <span className="text-[9px] text-slate-400 font-mono">({m.id})</span></td>
                    <td className="py-2 font-mono font-bold text-red-500">{m.healthScore}%</td>
                    <td className="py-2 font-semibold text-slate-500">{m.riskLevel}</td>
                    <td className="py-2 font-mono">1.8h / Mo</td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* EXECUTIVE SUMMARY REPORT */}
      <div className="glass-card p-5 space-y-4 border border-blue-100 bg-blue-50/20">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Executive Summary Operations Report</h3>
        <p className="text-[10px] text-slate-600 leading-relaxed max-w-4xl">
          As of today, Veilon monitors <strong>{systemStats.total} devices</strong>, keeping a facility operating index of <strong>{systemHealth}%</strong>. 
          There are <strong>{systemStats.critical} critical alert states</strong> and <strong>{systemStats.warning} warnings</strong> active. 
          Preventative inspections scheduled are <strong>{systemStats.maintenanceDue} tickets</strong>, keeping downtime to a low 14.2 minutes monthly average. 
          Business Risk indices for plant line B are currently flagged <strong>Medium</strong>, and recommended actions include performing stator checks on the heavy compressor DEV-004.
        </p>
      </div>

    </div>
  );
};
