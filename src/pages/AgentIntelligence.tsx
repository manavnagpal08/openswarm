import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import {
  SwarmAgent, AgentResponse, handleReportExport
} from '../services/AgentOrchestrator';
import {
  Play, Pause, RotateCcw, Cpu, CheckCircle2, Terminal,
  ArrowRight, Zap, Brain, Activity, Shield, Eye, ChevronDown
} from 'lucide-react';

const AGENTS = [
  { agent: new SwarmAgent('Monitoring Agent', 'Ingests live raw sensor telemetry stream.', []), color: '#3b82f6', icon: Activity },
  { agent: new SwarmAgent('Baseline Learning Agent', 'Calculates metric deviation rates against baselines.', []), color: '#8b5cf6', icon: Brain },
  { agent: new SwarmAgent('Anomaly Detection Agent', 'Classifies incidents and isolates affected units.', []), color: '#f59e0b', icon: Eye },
  { agent: new SwarmAgent('Root Cause Agent', 'Diagnoses physical fault mechanics.', []), color: '#ef4444', icon: Zap },
  { agent: new SwarmAgent('Impact Prediction Agent', 'Predicts line buffers and downtime risk levels.', []), color: '#ec4899', icon: Activity },
  { agent: new SwarmAgent('Planner Agent', 'Dispatches maintenance tickets and calendars.', []), color: '#10b981', icon: CheckCircle2 },
  { agent: new SwarmAgent('Supervisor Agent', 'Reviews checklists and validates execution reports.', []), color: '#0ea5e9', icon: Shield },
];

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'handoff' | 'success' | 'warn';
  json?: any;
}

export const AgentIntelligence: React.FC = () => {
  const { machines, setMachines, setTickets, triggerAlert } = useSimulation();

  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [failureInjected, setFailureInjected] = useState<boolean>(true);

  const [agentStatuses, setAgentStatuses] = useState<string[]>(Array(7).fill('waiting'));
  const [agentRuntimes, setAgentRuntimes] = useState<number[]>(Array(7).fill(0));
  const [agentConfidences, setAgentConfidences] = useState<number[]>(Array(7).fill(0));
  const [agentOutputs, setAgentOutputs] = useState<string[]>(Array(7).fill(''));

  const [payloadContext, setPayloadContext] = useState<any>(null);
  const [cycleCount, setCycleCount] = useState(0);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: 'Veilon multi-agent telemetry framework initialized.', type: 'info' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!payloadContext) {
      const randDev = machines[Math.floor(Math.random() * machines.length)];
      setPayloadContext({
        device: randDev,
        telemetry: {
          temperature: 75 + Math.random() * 20,
          vibration: 2.1 + Math.random() * 2,
          pressure: 2.5 + Math.random()
        }
      });
      setActiveStep(0);
    }
  }, [machines, payloadContext]);

  useEffect(() => {
    let timer: any;
    if (isRunning && activeStep >= 0 && activeStep < 7) {
      setAgentStatuses(prev => { const n = [...prev]; n[activeStep] = 'running'; return n; });

      const agent = AGENTS[activeStep].agent;
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `[Orchestrator] → Handing off to [${agent.name}]`,
        type: 'info', json: payloadContext
      }]);

      let ticks = 0;
      const interval = setInterval(() => {
        ticks += 0.1;
        setAgentRuntimes(prev => { const n = [...prev]; n[activeStep] = Math.round(ticks * 10) / 10; return n; });
      }, 100);

      timer = setTimeout(() => {
        clearInterval(interval);
        const response: AgentResponse = agent.execute(payloadContext);
        setAgentStatuses(prev => { const n = [...prev]; n[activeStep] = response.status; return n; });
        setAgentConfidences(prev => { const n = [...prev]; n[activeStep] = response.confidence; return n; });
        setAgentOutputs(prev => { const n = [...prev]; n[activeStep] = response.supportingMetrics; return n; });

        setLogs(prev => [...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `[${agent.name}] ✓ reasoning output parsed`, type: 'success' },
          { timestamp: new Date().toLocaleTimeString(), message: `[JSON Handoff Payload]`, type: 'handoff', json: response.handoffPayload }
        ]);

        if (failureInjected && activeStep === 2) {
          triggerAlert({
            severity: 'critical',
            deviceName: response.handoffPayload.deviceName,
            deviceId: response.handoffPayload.deviceId,
            issue: 'Critical temperature anomaly detected.',
            status: 'active'
          });
          setMachines(prev => prev.map(m => m.id === response.handoffPayload.deviceId ? {
            ...m, status: 'critical', healthScore: 48, riskLevel: 'Critical',
            lastUpdated: new Date().toLocaleTimeString()
          } : m));
        }

        setPayloadContext(response.handoffPayload);
        setActiveStep(prev => prev + 1);
      }, 1400);

    } else if (activeStep === 7) {
      timer = setTimeout(() => {
        setCycleCount(c => c + 1);
        setAgentStatuses(Array(7).fill('waiting'));
        setAgentRuntimes(Array(7).fill(0));
        setAgentConfidences(Array(7).fill(0));
        setAgentOutputs(Array(7).fill(''));
        const randDev = machines[Math.floor(Math.random() * machines.length)];
        setPayloadContext({
          device: randDev,
          telemetry: { temperature: 75 + Math.random() * 20, vibration: 2.1 + Math.random() * 2, pressure: 2.5 + Math.random() }
        });
        setFailureInjected(Math.random() > 0.4);
        setActiveStep(0);
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: `─── New telemetry frame ingested for ${randDev.id} ───`,
          type: 'info'
        }]);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [isRunning, activeStep, failureInjected, machines]);

  const completedCount = agentStatuses.filter(s => s === 'completed').length;
  const overallProgress = Math.round((completedCount / 7) * 100);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(245,158,11,0.35)'
            }}>
              <Cpu size={19} color="#fff" style={{ animation: 'spin 4s linear infinite' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                Veilon Multi-Agent Center
              </h1>
              <p style={{ fontSize: 10, color: '#64748b', margin: 0, marginTop: 2 }}>
                Live OpenSwarm orchestration · {cycleCount} cycles completed · {completedCount}/7 agents active
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Progress pill */}
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 100,
            padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{ width: 80, height: 5, borderRadius: 100, background: '#e2e8f0', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${overallProgress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ec4899)', borderRadius: 100 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>{overallProgress}%</span>
          </div>

          <button onClick={() => setIsRunning(r => !r)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            background: isRunning ? '#fef2f2' : 'linear-gradient(135deg, #f59e0b, #ec4899)',
            color: isRunning ? '#ef4444' : '#fff',
            boxShadow: isRunning ? 'none' : '0 4px 14px rgba(245,158,11,0.3)',
            transition: 'all 0.2s ease'
          }}>
            {isRunning ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
          </button>

          <button onClick={() => { setAgentStatuses(Array(7).fill('waiting')); setAgentRuntimes(Array(7).fill(0)); setAgentConfidences(Array(7).fill(0)); setPayloadContext(null); setActiveStep(-1); setLogs([{ timestamp: new Date().toLocaleTimeString(), message: 'Simulation reset.', type: 'info' }]); }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
            border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            background: '#fff', color: '#64748b'
          }}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* ── Main 3-col Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT: Agent Pipeline ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
            Agent Pipeline
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {AGENTS.map((agentDef, index) => {
              const status = agentStatuses[index];
              const runtime = agentRuntimes[index];
              const conf = agentConfidences[index];
              const Icon = agentDef.icon;

              const isRunningNow = status === 'running';
              const isDone = status === 'completed';

              return (
                <div key={agentDef.agent.name} style={{ position: 'relative' }}>
                  {/* Connector line */}
                  {index < 6 && (
                    <div style={{
                      position: 'absolute', left: 21, top: '100%', width: 2, height: 12,
                      background: isDone ? agentDef.color : '#e2e8f0', zIndex: 1,
                      transition: 'background 0.3s'
                    }} />
                  )}

                  <motion.div
                    animate={isRunningNow ? { boxShadow: [`0 0 0 0 ${agentDef.color}30`, `0 0 0 6px ${agentDef.color}15`, `0 0 0 0 ${agentDef.color}00`] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 10px',
                      borderRadius: 12, marginBottom: 12, cursor: 'default',
                      background: isRunningNow ? `${agentDef.color}10` : isDone ? `${agentDef.color}06` : 'transparent',
                      border: `1px solid ${isRunningNow ? agentDef.color + '40' : isDone ? agentDef.color + '20' : '#f1f5f9'}`,
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isRunningNow ? agentDef.color : isDone ? agentDef.color + '20' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.25s'
                    }}>
                      <Icon size={13} color={isRunningNow ? '#fff' : isDone ? agentDef.color : '#94a3b8'} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: isRunningNow ? '#0f172a' : isDone ? '#0f172a' : '#94a3b8' }}>
                          {agentDef.agent.name}
                        </span>
                        <span style={{
                          fontSize: 7, fontWeight: 800, textTransform: 'uppercase',
                          color: isRunningNow ? agentDef.color : isDone ? '#10b981' : '#94a3b8',
                          background: isRunningNow ? `${agentDef.color}15` : isDone ? '#f0fdf4' : '#f8fafc',
                          border: `1px solid ${isRunningNow ? agentDef.color + '30' : isDone ? '#bbf7d0' : '#f1f5f9'}`,
                          borderRadius: 100, padding: '2px 6px'
                        }}>
                          {isRunningNow ? '⟳ running' : isDone ? '✓ done' : 'waiting'}
                        </span>
                      </div>
                      <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{agentDef.agent.systemPrompt}</div>
                      {(isRunningNow || isDone) && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                          <span style={{ fontSize: 8, fontFamily: 'monospace', color: agentDef.color }}>⏱ {runtime}s</span>
                          {isDone && <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#10b981' }}>🎯 {conf}%</span>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: Orchestrator Log Feed ── */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #1e293b',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', fontFamily: 'monospace', marginLeft: 4 }}>
              orchestrator.log — Veilon OpenSwarm Runtime
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: 9, color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>STREAMING</span>
            </div>
          </div>

          <div style={{ height: 560, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AnimatePresence initial={false}>
              {logs.map((log, index) => {
                const isHandoff = log.type === 'handoff';
                const isSuccess = log.type === 'success';
                const isWarn = log.type === 'warn';
                const isExpanded = expandedLog === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      borderLeft: `2px solid ${isHandoff ? '#3b82f6' : isSuccess ? '#10b981' : isWarn ? '#f59e0b' : '#334155'}`,
                      paddingLeft: 10, paddingTop: 4, paddingBottom: 4
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', marginTop: 1 }}>
                        {log.timestamp}
                      </span>
                      <span style={{
                        fontSize: 9, fontFamily: 'monospace',
                        color: isHandoff ? '#93c5fd' : isSuccess ? '#6ee7b7' : isWarn ? '#fcd34d' : '#94a3b8'
                      }}>
                        {log.message}
                      </span>
                      {log.json && (
                        <button onClick={() => setExpandedLog(isExpanded ? null : index)} style={{
                          marginLeft: 'auto', fontSize: 8, color: '#475569', background: '#1e293b',
                          border: '1px solid #334155', borderRadius: 4, padding: '2px 6px',
                          cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0
                        }}>
                          <ChevronDown size={9} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          JSON
                        </button>
                      )}
                    </div>
                    {log.json && isExpanded && (
                      <motion.pre
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        style={{
                          background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8,
                          padding: '10px', fontSize: 8, color: '#64748b',
                          fontFamily: 'monospace', marginTop: 6, overflowX: 'auto',
                          maxHeight: 180, overflowY: 'auto', lineHeight: 1.6
                        }}
                      >
                        {JSON.stringify(log.json, null, 2)}
                      </motion.pre>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* ── RIGHT: Stats & Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Current Device */}
          {payloadContext?.device && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Current Target Device</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', marginBottom: 4 }}>{payloadContext.device.id}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 12 }}>{payloadContext.device.name || payloadContext.device.id}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Temperature', val: `${payloadContext.telemetry?.temperature?.toFixed(1)}°C`, color: '#3b82f6' },
                  { label: 'Vibration', val: `${payloadContext.telemetry?.vibration?.toFixed(2)} mm/s`, color: '#8b5cf6' },
                  { label: 'Pressure', val: `${payloadContext.telemetry?.pressure?.toFixed(2)} bar`, color: '#10b981' },
                  { label: 'Cycle #', val: `${cycleCount + 1}`, color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{stat.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{stat.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Stats */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Swarm Statistics</div>
            {[
              { label: 'Completed Agents', val: `${completedCount}/7`, color: '#10b981' },
              { label: 'Pipeline Progress', val: `${overallProgress}%`, color: '#3b82f6' },
              { label: 'Total Cycles', val: `${cycleCount}`, color: '#f59e0b' },
              { label: 'Failure Injection', val: failureInjected ? 'Active' : 'Off', color: failureInjected ? '#ef4444' : '#10b981' },
              { label: 'Status', val: isRunning ? 'Running' : 'Paused', color: isRunning ? '#10b981' : '#f59e0b' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 4 ? '1px solid #f8fafc' : 'none' }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>{stat.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'monospace', color: stat.color }}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Handoff flow visual */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Handoff Flow</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              {AGENTS.map((a, i) => {
                const status = agentStatuses[i];
                const done = status === 'completed';
                const running = status === 'running';
                return (
                  <React.Fragment key={i}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      background: running ? a.color : done ? a.color + '33' : '#f1f5f9',
                      border: `1px solid ${running ? a.color : done ? a.color + '50' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s', fontSize: 8, fontWeight: 800, color: running ? '#fff' : done ? a.color : '#94a3b8'
                    }} title={a.agent.name}>
                      {i + 1}
                    </div>
                    {i < 6 && <ArrowRight size={10} color="#e2e8f0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AgentIntelligence;
