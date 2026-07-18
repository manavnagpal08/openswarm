import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine 
} from 'recharts';
import { 
  Server, CheckCircle2, AlertTriangle, XOctagon, Wrench, HeartPulse, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, Thermometer, Gauge, Zap, Activity 
} from 'lucide-react';

interface FeedEvent {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'warn' | 'success';
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { machines, alerts, chartHistory, systemHealth, systemStats } = useSimulation();

  // Time range selection
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m');

  // Live Feed State
  const [feed, setFeed] = useState<FeedEvent[]>([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'Monitoring Agent received telemetry from DEV-001.', type: 'info' },
    { id: '2', time: new Date().toLocaleTimeString(), message: 'System health index nominal at 94%.', type: 'success' }
  ]);

  // Feed updates ticker
  useEffect(() => {
    const feedMessages = [
      'Ingesting raw sensor frames from Sector C Line 2.',
      'Baseline analysis checked DEV-005 deviation parameter (1.2% variance).',
      'Orchestrator validation loop completed successfully.',
      'Veilon operations center data backup finalized.',
      'Security governance firewall rules synchronized.',
      'Vibration checks compiled for DEV-014. Status: nominal.',
      'Top nav live suggestion query resolved.'
    ];

    const timer = setInterval(() => {
      const randomMsg = feedMessages[Math.floor(Math.random() * feedMessages.length)];
      const newEvent: FeedEvent = {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString(),
        message: randomMsg,
        type: Math.random() > 0.8 ? 'success' : 'info'
      };

      setFeed(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 3550);

    return () => clearInterval(timer);
  }, []);

  // 1. Sparkline mock datasets for the 5 parameters
  const lastHistory = chartHistory.slice(-6);

  // Get current average metrics
  const activeCount = machines.filter(m => m.status !== 'offline').length || 1;
  const currentTemp = Math.round(machines.reduce((a, b) => a + b.telemetry.temperature, 0) / activeCount);
  const currentPressure = Math.round((machines.reduce((a, b) => a + b.telemetry.pressure, 0) / activeCount) * 10) / 10;
  const currentPower = Math.round(machines.reduce((a, b) => a + b.telemetry.powerConsumption, 0) / activeCount);
  const currentHumidity = Math.round(machines.reduce((a, b) => a + b.telemetry.humidity, 0) / activeCount);
  const currentVibration = Math.round((machines.reduce((a, b) => a + b.telemetry.vibration, 0) / activeCount) * 10) / 10;

  const sparklineKPIs = [
    { title: 'Temperature', val: `${currentTemp}°C`, icon: Thermometer, color: 'text-blue-600', dataKey: 'temperature', badge: 'Nominal' },
    { title: 'Pressure', val: `${currentPressure} bar`, icon: Gauge, color: 'text-purple-650', dataKey: 'pressure', badge: 'Nominal' },
    { title: 'Power', val: `${currentPower} kW`, icon: Zap, color: 'text-pink-650', dataKey: 'powerConsumption', badge: 'Nominal' },
    { title: 'Humidity', val: `${currentHumidity}%`, icon: HeartPulse, color: 'text-amber-500', dataKey: 'humidity', badge: 'Nominal' },
    { title: 'Vibration', val: `${currentVibration} mm/s`, icon: Activity, color: 'text-emerald-600', dataKey: 'vibration', badge: 'Nominal' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Veilon Operations Console</h1>
        <p className="text-slate-500 text-xs mt-1">Real-time telemetry, multi-agent diagnostics, and human-in-the-loop governance</p>
      </div>

      {/* TOP ROW: Five Live KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {sparklineKPIs.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card p-4 flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                <span>{kpi.title}</span>
                <Icon size={14} className={kpi.color} />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-lg font-black font-mono text-slate-855">{kpi.val}</span>
                  <p className="text-[9px] text-green-600 font-bold flex items-center mt-0.5"><ArrowUpRight size={10} /> Stable</p>
                </div>
                {/* Mini Sparkline Chart */}
                <div className="w-16 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lastHistory}>
                      <Line type="monotone" dataKey={kpi.dataKey} stroke="#2563eb" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN TELEMETRY PANEL: Dual Sync Graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Graph 1 (Primary): Temp, Pressure, Vibration */}
        <div className="xl:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Primary Core Telemetry</h2>
              <p className="text-[9px] text-slate-400">Thermals, pressure and mechanical load vibration variables</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
              {['1m', '5m', '15m', '1h'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r as any)}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                    timeRange === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                
                <Area yAxisId="left" type="monotone" name="Temp (°C)" dataKey="temperature" stroke="#2563eb" fill="none" strokeWidth={1.8} />
                <Area yAxisId="right" type="monotone" name="Pressure (bar)" dataKey="pressure" stroke="#8b5cf6" fill="none" strokeWidth={1.8} />
                <Area yAxisId="right" type="monotone" name="Vibration (mm/s)" dataKey="vibration" stroke="#22c55e" fill="none" strokeWidth={1.8} />
                
                {/* Threshold Markers */}
                <ReferenceLine yAxisId="left" y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical Threshold', fill: '#ef4444', fontSize: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2 (Synchronized): Power, Humidity */}
        <div className="xl:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">Secondary Utilities Stream</h2>
            <p className="text-[9px] text-slate-400 mb-3">Power load consumption and humidity diagnostics</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 8 }} stroke="#f1f5f9" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />

                <Area yAxisId="left" type="monotone" name="Power (kW)" dataKey="powerConsumption" stroke="#ec4899" fill="none" strokeWidth={1.8} />
                <Area yAxisId="right" type="monotone" name="Humidity (%)" dataKey="humidity" stroke="#f59e0b" fill="none" strokeWidth={1.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Live Feed & Alerts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* SOC Live Log Feed */}
        <div className="xl:col-span-3 glass-card p-5 flex flex-col h-[280px] overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">Live Activity Feed</h2>
          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] leading-relaxed scrollbar-thin">
            <AnimatePresence initial={false}>
              {feed.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 text-slate-650 border-l-2 border-blue-500 pl-2 py-0.5"
                >
                  <span className="text-slate-400">[{event.time}]</span>
                  <span>{event.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="xl:col-span-2 glass-card p-5 flex flex-col h-[280px] overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">Recent Alerts</h2>
          <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex justify-between items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800">{alert.deviceName}</h4>
                  <p className="text-[9px] text-slate-455 truncate max-w-xs">{alert.issue}</p>
                </div>
                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  alert.severity === 'critical' ? 'bg-red-50 text-red-655 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
