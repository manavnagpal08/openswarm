import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine, CartesianGrid
} from 'recharts';
import {
  Server, CheckCircle2, AlertTriangle, XOctagon, Wrench, HeartPulse,
  ArrowUpRight, ArrowDownRight, Clock, Thermometer, Gauge, Zap, Activity,
  Wifi, Shield, TrendingUp, TrendingDown, Radio, Eye, Cpu, Database, BarChart3
} from 'lucide-react';

interface FeedEvent {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'critical';
  agent?: string;
}

// Beautiful custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 12,
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: 9, marginBottom: 6, fontFamily: 'monospace' }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#e2e8f0', fontSize: 9, fontFamily: 'monospace' }}>
              {entry.name}: <strong style={{ color: '#fff' }}>{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { machines, alerts, chartHistory, systemHealth, systemStats } = useSimulation();

  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [pulseActive, setPulseActive] = useState(true);

  // Extended live feed with more categories and messages
  const [feed, setFeed] = useState<FeedEvent[]>([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'Monitoring Agent initialized. Streaming telemetry from 20 nodes.', type: 'success', agent: 'Monitor' },
    { id: '2', time: new Date().toLocaleTimeString(), message: 'Orchestrator sync confirmed. System health at 94%.', type: 'info', agent: 'Orchestrator' },
    { id: '3', time: new Date().toLocaleTimeString(), message: 'Predictive model: DEV-003 vibration variance within bounds.', type: 'info', agent: 'Predictor' },
  ]);

  const feedMessages = [
    { msg: 'Ingesting raw sensor frames from Sector C Line 2.', agent: 'Monitor', type: 'info' },
    { msg: 'Baseline analysis: DEV-005 deviation 1.2% — within tolerance.', agent: 'Analyzer', type: 'info' },
    { msg: 'Orchestrator validation loop completed successfully.', agent: 'Orchestrator', type: 'success' },
    { msg: 'Governance layer backup finalized — audit log persisted.', agent: 'Governance', type: 'success' },
    { msg: 'Security firewall rules synchronized across cluster.', agent: 'Security', type: 'success' },
    { msg: 'DEV-014 vibration nominal. Mechanical checks passed.', agent: 'Monitor', type: 'info' },
    { msg: 'AI swarm consensus reached: 8/8 agents aligned on prediction.', agent: 'Swarm', type: 'success' },
    { msg: 'Pressure anomaly detected on DEV-007. Escalating to reviewer.', agent: 'Predictor', type: 'warn' },
    { msg: 'Temperature threshold 79°C crossed on DEV-011. Auto-alert sent.', agent: 'Analyzer', type: 'warn' },
    { msg: 'Digital twin state updated for DEV-002 — divergence: 0.04%.', agent: 'Twin', type: 'info' },
    { msg: 'Maintenance ticket MT-0041 approved by control center.', agent: 'Control', type: 'success' },
    { msg: 'Power load on DEV-009 at 98%. Scaling down recommended.', agent: 'Monitor', type: 'warn' },
    { msg: 'Network latency nominal across all nodes. Avg: 14ms.', agent: 'Network', type: 'info' },
    { msg: 'Agent handoff: Analyzer → Predictor → Governance completed.', agent: 'Orchestrator', type: 'info' },
    { msg: 'CRITICAL: DEV-018 motor bearing failure probability at 76%.', agent: 'Predictor', type: 'critical' },
    { msg: 'Self-healing protocol initiated for DEV-018. Monitoring closely.', agent: 'Control', type: 'warn' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const r = feedMessages[Math.floor(Math.random() * feedMessages.length)];
      const newEvent: FeedEvent = {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString(),
        message: r.msg,
        type: r.type as any,
        agent: r.agent
      };
      setFeed(prev => [newEvent, ...prev.slice(0, 9)]);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Pulse animation
  useEffect(() => {
    const t = setInterval(() => setPulseActive(p => !p), 1200);
    return () => clearInterval(t);
  }, []);

  const lastHistory = chartHistory.slice(-8);

  const activeCount = machines.filter(m => m.status !== 'offline').length || 1;
  const currentTemp = (machines.reduce((a, b) => a + b.telemetry.temperature, 0) / activeCount).toFixed(1);
  const currentPressure = (machines.reduce((a, b) => a + b.telemetry.pressure, 0) / activeCount).toFixed(2);
  const currentPower = Math.round(machines.reduce((a, b) => a + b.telemetry.powerConsumption, 0) / activeCount);
  const currentHumidity = (machines.reduce((a, b) => a + b.telemetry.humidity, 0) / activeCount).toFixed(1);
  const currentVibration = (machines.reduce((a, b) => a + b.telemetry.vibration, 0) / activeCount).toFixed(2);
  const avgLatency = Math.round(machines.filter(m => m.status !== 'offline').reduce((a, b) => a + (b.telemetry.latency ?? 0), 0) / activeCount);

  // Color helper for type badges
  const getFeedStyle = (type: string) => {
    switch (type) {
      case 'success': return { border: '#10b981', bg: 'rgba(16,185,129,0.08)', dot: '#10b981', label: '#10b981', text: '#d1fae5' };
      case 'warn': return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', dot: '#f59e0b', label: '#f59e0b', text: '#fef3c7' };
      case 'critical': return { border: '#ef4444', bg: 'rgba(239,68,68,0.10)', dot: '#ef4444', label: '#ef4444', text: '#fee2e2' };
      default: return { border: '#6366f1', bg: 'rgba(99,102,241,0.06)', dot: '#6366f1', label: '#a5b4fc', text: '#e0e7ff' };
    }
  };

  const kpiCards = [
    {
      title: 'Temperature', val: `${currentTemp}°C`, sub: 'Fleet avg core temp',
      icon: Thermometer, gradient: 'from-blue-500 to-cyan-400', glow: '#3b82f6',
      dataKey: 'temperature', strokeColor: '#60a5fa', trend: 'up', status: parseFloat(currentTemp) > 80 ? 'critical' : 'nominal'
    },
    {
      title: 'Pressure', val: `${currentPressure} bar`, sub: 'Hydraulic line pressure',
      icon: Gauge, gradient: 'from-violet-500 to-purple-400', glow: '#8b5cf6',
      dataKey: 'pressure', strokeColor: '#a78bfa', trend: 'stable', status: 'nominal'
    },
    {
      title: 'Power Load', val: `${currentPower} kW`, sub: 'Avg power draw',
      icon: Zap, gradient: 'from-pink-500 to-rose-400', glow: '#ec4899',
      dataKey: 'powerConsumption', strokeColor: '#f472b6', trend: 'up', status: 'nominal'
    },
    {
      title: 'Humidity', val: `${currentHumidity}%`, sub: 'Ambient RH sensor',
      icon: HeartPulse, gradient: 'from-amber-500 to-orange-400', glow: '#f59e0b',
      dataKey: 'humidity', strokeColor: '#fbbf24', trend: 'stable', status: 'nominal'
    },
    {
      title: 'Vibration', val: `${currentVibration} mm/s`, sub: 'Mechanical vibration',
      icon: Activity, gradient: 'from-emerald-500 to-green-400', glow: '#10b981',
      dataKey: 'vibration', strokeColor: '#34d399', trend: 'down', status: 'nominal'
    },
    {
      title: 'Latency', val: `${avgLatency} ms`, sub: 'WebSocket round-trip',
      icon: Radio, gradient: 'from-sky-500 to-teal-400', glow: '#0ea5e9',
      dataKey: 'humidity', strokeColor: '#38bdf8', trend: 'stable', status: 'nominal'
    },
  ];

  const statusColor = (s: string) => s === 'nominal' ? '#10b981' : s === 'critical' ? '#ef4444' : '#f59e0b';

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
            Veilon Operations Console
          </h1>
          <p style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>
            Real-time telemetry · Multi-agent diagnostics · AI governance
          </p>
        </div>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '6px 14px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981',
            boxShadow: pulseActive ? '0 0 0 4px rgba(16,185,129,0.25)' : '0 0 0 0px rgba(16,185,129,0)',
            transition: 'box-shadow 0.6s ease'
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>LIVE · {activeCount} NODES ACTIVE</span>
        </div>
      </div>

      {/* ── SYSTEM STATUS BAR ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '16px 20px', border: '1px solid #334155'
      }}>
        {[
          { label: 'Healthy', val: systemStats.healthy, icon: CheckCircle2, color: '#10b981' },
          { label: 'Warning', val: systemStats.warning, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Critical', val: systemStats.critical, icon: XOctagon, color: '#ef4444' },
          { label: 'Offline', val: systemStats.offline, icon: Server, color: '#64748b' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.color}30` }}>
                <Icon size={16} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── KPI SPARKLINE CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
                padding: '14px 14px 10px', cursor: 'pointer',
                boxShadow: `0 4px 20px ${kpi.glow}18`,
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Gradient accent top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${kpi.glow}, transparent)`, borderRadius: '16px 16px 0 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${kpi.glow}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${kpi.glow}25` }}>
                  <Icon size={13} color={kpi.glow} />
                </div>
                <span style={{
                  fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                  color: statusColor(kpi.status), background: `${statusColor(kpi.status)}15`,
                  border: `1px solid ${statusColor(kpi.status)}30`, borderRadius: 100, padding: '2px 6px'
                }}>{kpi.status}</span>
              </div>

              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{kpi.title}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{kpi.val}</div>
              <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2, marginBottom: 6 }}>{kpi.sub}</div>

              {/* Sparkline */}
              <div style={{ height: 36 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lastHistory}>
                    <defs>
                      <linearGradient id={`spark-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={kpi.glow} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={kpi.glow} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={kpi.dataKey} stroke={kpi.strokeColor} strokeWidth={1.5} fill={`url(#spark-${idx})`} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── MAIN TELEMETRY CHARTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

        {/* Chart 1: Primary Telemetry */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '20px 20px 14px', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
                <h2 style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Primary Core Telemetry</h2>
              </div>
              <p style={{ fontSize: 9, color: '#94a3b8' }}>Temperature · Pressure · Vibration — dual-axis scaling</p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              {['1m', '5m', '15m', '1h'].map(r => (
                <button key={r} onClick={() => setTimeRange(r as any)} style={{
                  padding: '3px 9px', borderRadius: 7, fontSize: 9, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: timeRange === r ? '#3b82f6' : 'transparent',
                  color: timeRange === r ? '#fff' : '#94a3b8',
                  boxShadow: timeRange === r ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}>{r}</button>
              ))}
            </div>
          </div>

          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradVibration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }} stroke="#f1f5f9" tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#f1f5f9" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#f1f5f9" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={7} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 8 }} />

                <Area yAxisId="left" type="monotone" name="Temp (°C)" dataKey="temperature"
                  stroke="#3b82f6" strokeWidth={2} fill="url(#gradTemp)" dot={false} />
                <Area yAxisId="right" type="monotone" name="Pressure (bar)" dataKey="pressure"
                  stroke="#8b5cf6" strokeWidth={2} fill="url(#gradPressure)" dot={false} />
                <Area yAxisId="right" type="monotone" name="Vibration (mm/s)" dataKey="vibration"
                  stroke="#10b981" strokeWidth={2} fill="url(#gradVibration)" dot={false} />

                <ReferenceLine yAxisId="left" y={80} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.2}
                  label={{ value: '⚠ 80°C', fill: '#ef4444', fontSize: 8, fontFamily: 'monospace' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Utilities */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '20px 20px 14px', boxShadow: '0 4px 24px rgba(236,72,153,0.06)' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ec4899', boxShadow: '0 0 6px #ec4899' }} />
              <h2 style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Utilities Stream</h2>
            </div>
            <p style={{ fontSize: 9, color: '#94a3b8' }}>Power consumption · Humidity — dual-axis scaling</p>
          </div>

          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'monospace' }} stroke="#f1f5f9" tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#f1f5f9" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#f1f5f9" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={7} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 8 }} />

                <Area yAxisId="left" type="monotone" name="Power (kW)" dataKey="powerConsumption"
                  stroke="#ec4899" strokeWidth={2} fill="url(#gradPower)" dot={false} />
                <Area yAxisId="right" type="monotone" name="Humidity (%)" dataKey="humidity"
                  stroke="#f59e0b" strokeWidth={2} fill="url(#gradHumidity)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── LIVE FEED + ALERTS + DEVICE HEALTH ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.2fr', gap: 16 }}>

        {/* Live Feed */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: '18px 18px 14px', overflow: 'hidden', height: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <h2 style={{ fontSize: 10, fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: 1 }}>Live Activity Feed</h2>
            <span style={{ marginLeft: 'auto', fontSize: 8, color: '#475569', fontFamily: 'monospace' }}>STREAMING</span>
          </div>
          <div style={{ height: 'calc(100% - 44px)', overflowY: 'auto' }}>
            <AnimatePresence initial={false}>
              {feed.map(event => {
                const s = getFeedStyle(event.type);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      borderLeft: `2px solid ${s.border}`,
                      background: s.bg,
                      borderRadius: '0 8px 8px 0',
                      padding: '6px 10px',
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 7, fontFamily: 'monospace', color: '#475569' }}>{event.time}</span>
                      {event.agent && (
                        <span style={{ fontSize: 7, fontWeight: 700, color: s.label, background: `${s.border}20`, border: `1px solid ${s.border}30`, borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace' }}>
                          {event.agent}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 9, color: s.text, fontFamily: 'monospace', lineHeight: 1.4, margin: 0 }}>{event.message}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px', overflow: 'hidden', height: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={13} color="#ef4444" />
            <h2 style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Alerts</h2>
            <span style={{ marginLeft: 'auto', fontSize: 8, fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 100, padding: '2px 7px' }}>
              {alerts.length} OPEN
            </span>
          </div>
          <div style={{ height: 'calc(100% - 44px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.slice(0, 5).map((alert) => (
              <motion.div key={alert.id} whileHover={{ x: 3 }} style={{
                padding: '10px 12px', borderRadius: 12,
                background: alert.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${alert.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                cursor: 'pointer'
              }} onClick={() => navigate('/alerts')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{alert.deviceName}</span>
                  <span style={{
                    fontSize: 7, fontWeight: 800, textTransform: 'uppercase',
                    color: alert.severity === 'critical' ? '#dc2626' : '#d97706',
                    background: alert.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                    border: `1px solid ${alert.severity === 'critical' ? '#fca5a5' : '#fde68a'}`,
                    borderRadius: 100, padding: '2px 6px'
                  }}>{alert.severity}</span>
                </div>
                <p style={{ fontSize: 8, color: '#64748b', margin: 0, lineHeight: 1.4, fontFamily: 'monospace' }}>{alert.issue}</p>
              </motion.div>
            ))}
            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', color: '#10b981', fontSize: 10, paddingTop: 40 }}>
                <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 8px' }} />
                All systems nominal
              </div>
            )}
          </div>
        </div>

        {/* Device Health Summary */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px', overflow: 'hidden', height: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Cpu size={13} color="#6366f1" />
            <h2 style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Device Health</h2>
          </div>
          <div style={{ height: 'calc(100% - 44px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {machines.slice(0, 10).map((m) => {
              const healthColor = m.healthScore >= 80 ? '#10b981' : m.healthScore >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <motion.div key={m.id} whileHover={{ x: 2 }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  onClick={() => navigate('/devices')}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: healthColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', fontWeight: 600, width: 54, flexShrink: 0 }}>{m.id}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 100, background: '#f1f5f9', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${m.healthScore}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ height: '100%', borderRadius: 100, background: `linear-gradient(90deg, ${healthColor}, ${healthColor}aa)` }}
                    />
                  </div>
                  <span style={{ fontSize: 8, fontFamily: 'monospace', color: healthColor, fontWeight: 700, width: 28, textAlign: 'right' }}>{m.healthScore}%</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
