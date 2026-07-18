import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import { 
  SwarmAgent, AgentResponse, handleReportExport 
} from '../services/AgentOrchestrator';
import { 
  Play, ShieldAlert, RotateCcw, Pause, Trash2, Cpu, CheckCircle2, Terminal, FileText, Download 
} from 'lucide-react';

const AGENTS = [
  new SwarmAgent('Monitoring Agent', 'Ingests live raw sensor telemetry stream.', []),
  new SwarmAgent('Baseline Learning Agent', 'Calculates metric deviation rates against baselines.', []),
  new SwarmAgent('Anomaly Detection Agent', 'Classifies incidents and isolates affected units.', []),
  new SwarmAgent('Root Cause Agent', 'Diagnoses physical fault mechanics.', []),
  new SwarmAgent('Impact Prediction Agent', 'Predicts line buffers and downtime risk levels.', []),
  new SwarmAgent('Planner Agent', 'Dispatches maintenance tickets and calendars.', []),
  new SwarmAgent('Supervisor Agent', 'Reviews checklists and validates execution reports.', [])
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
  const [isRunning, setIsRunning] = useState<boolean>(true); // Auto-running by default
  const [failureInjected, setFailureInjected] = useState<boolean>(true);
  
  const [agentStatuses, setAgentStatuses] = useState<string[]>(Array(7).fill('waiting'));
  const [agentRuntimes, setAgentRuntimes] = useState<number[]>(Array(7).fill(0));
  const [agentConfidences, setAgentConfidences] = useState<number[]>(Array(7).fill(0));
  const [agentOutputs, setAgentOutputs] = useState<string[]>(Array(7).fill(''));
  
  const [payloadContext, setPayloadContext] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: 'Veilon multi-agent telemetry framework initialized.', type: 'info' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Seeding the first payload
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

  // OpenSwarm loop
  useEffect(() => {
    let timer: any;
    
    if (isRunning && activeStep >= 0 && activeStep < 7) {
      setAgentStatuses(prev => {
        const next = [...prev];
        next[activeStep] = 'running';
        return next;
      });

      const agent = AGENTS[activeStep];
      
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `[Veilon Orchestrator] Handing off task to [${agent.name}]...`,
          type: 'info',
          json: payloadContext
        }
      ]);

      let ticks = 0;
      const interval = setInterval(() => {
        ticks += 0.1;
        setAgentRuntimes(prev => {
          const next = [...prev];
          next[activeStep] = Math.round(ticks * 10) / 10;
          return next;
        });
      }, 100);

      timer = setTimeout(() => {
        clearInterval(interval);

        const response: AgentResponse = agent.execute(payloadContext);
        
        setAgentStatuses(prev => {
          const next = [...prev];
          next[activeStep] = response.status;
          return next;
        });
        setAgentConfidences(prev => {
          const next = [...prev];
          next[activeStep] = response.confidence;
          return next;
        });
        setAgentOutputs(prev => {
          const next = [...prev];
          next[activeStep] = response.supportingMetrics;
          return next;
        });

        setLogs(prev => {
          const updated = [...prev];
          updated.push({
            timestamp: new Date().toLocaleTimeString(),
            message: `[${agent.name}] reasoning output successfully parsed.`,
            type: 'success'
          });
          updated.push({
            timestamp: new Date().toLocaleTimeString(),
            message: `[JSON Handoff]`,
            type: 'handoff',
            json: response.handoffPayload
          });
          return updated;
        });

        // Trigger updates
        if (failureInjected && activeStep === 2) {
          triggerAlert({
            severity: 'critical',
            deviceName: response.handoffPayload.deviceName,
            deviceId: response.handoffPayload.deviceId,
            issue: 'Critical temperature detected.',
            status: 'active'
          });
          setMachines(prev =>
            prev.map(m => m.id === response.handoffPayload.deviceId ? {
              ...m,
              status: 'critical',
              healthScore: 48,
              riskLevel: 'Critical',
              lastUpdated: new Date().toLocaleTimeString()
            } : m)
          );
        }

        setPayloadContext(response.handoffPayload);
        setActiveStep(prev => prev + 1);

      }, 1200); // Faster checks

    } else if (activeStep === 7) {
      // Completed, pause for 2 seconds and auto-start next device simulation
      timer = setTimeout(() => {
        // Reset states for next simulation
        setAgentStatuses(Array(7).fill('waiting'));
        setAgentRuntimes(Array(7).fill(0));
        setAgentConfidences(Array(7).fill(0));
        setAgentOutputs(Array(7).fill(''));
        
        const randDev = machines[Math.floor(Math.random() * machines.length)];
        setPayloadContext({
          device: randDev,
          telemetry: {
            temperature: 75 + Math.random() * 20,
            vibration: 2.1 + Math.random() * 2,
            pressure: 2.5 + Math.random()
          }
        });
        setFailureInjected(Math.random() > 0.4);
        setActiveStep(0);
        
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), message: `--- Ingesting next telemetry frame for device ${randDev.id} ---`, type: 'info' }
        ]);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isRunning, activeStep, failureInjected, machines]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <Cpu size={24} className="text-blue-600 animate-spin" style={{ animationDuration: '4s' }} /> Veilon Multi-Agent Center
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Visualizing real-time OpenAI Agents SDK collaborative handoffs with auto-ingestion simulations.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 overflow-hidden h-[calc(100vh-170px)]">
        
        {/* LEFT PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col p-4 overflow-y-auto shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-4">
            Collaboration Pipeline
          </h2>
          
          <div className="space-y-4">
            {AGENTS.map((agent, index) => {
              const status = agentStatuses[index];
              const runtime = agentRuntimes[index];
              const conf = agentConfidences[index];
              
              let statusBorder = 'border-slate-200 bg-slate-50/50';
              let statusText = 'text-slate-400';
              let dotColor = 'bg-slate-400';
              let isPulse = false;

              if (status === 'running') {
                statusBorder = 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/10';
                statusText = 'text-blue-600 font-bold';
                dotColor = 'bg-blue-600';
                isPulse = true;
              } else if (status === 'completed') {
                statusBorder = 'border-green-200 bg-green-50/20';
                statusText = 'text-green-700 font-semibold';
                dotColor = 'bg-green-500';
              }

              return (
                <div key={agent.name} className="relative">
                  {index < 6 && (
                    <div className="absolute left-6 top-full h-4 w-[1px] bg-slate-200" />
                  )}

                  <motion.div 
                    animate={isPulse ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${statusBorder}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">{agent.name}</h3>
                        <p className="text-[9px] text-slate-455 mt-0.5">{agent.systemPrompt}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${statusText} bg-white`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {status}
                      </span>
                    </div>

                    {(status === 'running' || status === 'completed') && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[9px] text-slate-500 font-mono">
                        <div>Runtime: {runtime}s</div>
                        <div>Confidence: {conf}%</div>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Terminal size={14} className="text-blue-600" /> Orchestrator JSON Feed
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-[9px] leading-relaxed bg-white scrollbar-thin">
            {logs.map((log, index) => {
              let textClass = 'text-slate-650';
              let prefix = '➜';
              if (log.type === 'success') {
                textClass = 'text-green-700 font-semibold';
                prefix = '✔';
              } else if (log.type === 'warn') {
                textClass = 'text-amber-700 font-semibold';
                prefix = '⚠';
              } else if (log.type === 'handoff') {
                textClass = 'text-blue-650 border-l border-blue-200 pl-3.5 my-1';
                prefix = '↳ Handoff:';
              }

              return (
                <div key={index} className={`flex flex-col gap-1 ${textClass}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-slate-400 select-none">[{log.timestamp}]</span>
                    <span className="text-slate-450 font-bold select-none">{prefix}</span>
                    <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                  </div>
                  {log.json && (
                    <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[8px] text-slate-500 max-h-36 overflow-y-auto mt-1 ml-6 leading-normal">
                      {JSON.stringify(log.json, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col p-4 overflow-y-auto shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-4">
            Simulation Controller
          </h2>
          <div className="py-20 text-center text-xs text-slate-450 italic">
            Continuous auto-ingestion simulations active. Devices are cycled every 2 seconds to evaluate multi-agent decision boundaries.
          </div>
        </div>

      </div>
    </div>
  );
};
export default AgentIntelligence;
