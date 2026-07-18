import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventBus } from '../services/EventBus';
import { useSimulation } from '../context/SimulationContext';
import { 
  Play, Pause, SkipForward, Cpu, ShieldAlert, Sparkles, TrendingUp, History, Clock, Percent, AlertCircle 
} from 'lucide-react';

interface SwarmNode {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
}

const SWARM_NODES: SwarmNode[] = [
  { id: 'monitoring', name: 'Monitoring Agent', role: 'Telemetry Ingestion', x: 80, y: 150 },
  { id: 'baseline', name: 'Baseline Agent', role: 'Drift Identification', x: 220, y: 80 },
  { id: 'anomaly', name: 'Anomaly Agent', role: 'Signature Detection', x: 380, y: 80 },
  { id: 'rootcause', name: 'Root Cause Agent', role: 'Physical Fault Isolation', x: 540, y: 150 },
  { id: 'skeptic', name: 'Skeptic Agent', role: 'Hypothesis Challenge', x: 680, y: 240 },
  { id: 'impact', name: 'Impact Agent', role: 'Downtime Predictor', x: 540, y: 320 },
  { id: 'planner', name: 'Planner Agent', role: 'Workorder Assigner', x: 380, y: 320 },
  { id: 'supervisor', name: 'Supervisor Agent', role: 'Consensus Validator', x: 220, y: 240 }
];

export const SwarmCenter: React.FC = () => {
  const { machines } = useSimulation();

  // Active status lists
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [nodeStates, setNodeStates] = useState<{ [key: string]: 'idle' | 'running' | 'waiting' | 'validated' | 'error' }>({
    monitoring: 'idle',
    baseline: 'idle',
    anomaly: 'idle',
    rootcause: 'idle',
    skeptic: 'idle',
    impact: 'idle',
    planner: 'idle',
    supervisor: 'idle'
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);

  // Skeptic state mockup
  const skepticData = {
    agreement: 82,
    disagreement: 18,
    evidence: 'Vibration deviation of 3.4mm/s points to primary bearing friction rather than standard stator cooling failure.',
    rootCauseClaim: 'Cooling Fan Failure (84% Confidence)',
    skepticClaim: 'Rotor Bearing Lubrication Loss (76% Confidence)',
    finalDecision: 'Supervisor resolution: Cooling Fan overhaul required immediately, stator temperature threshold reset to 93%.'
  };

  // Event bus listeners
  useEffect(() => {
    const handleStarted = (data: any) => {
      if (data?.agentId) {
        setNodeStates(prev => ({ ...prev, [data.agentId]: 'running' }));
      }
    };
    const handleCompleted = (data: any) => {
      if (data?.agentId) {
        setNodeStates(prev => ({ ...prev, [data.agentId]: 'validated' }));
      }
    };

    eventBus.on('AgentStarted', handleStarted);
    eventBus.on('AgentCompleted', handleCompleted);

    return () => {
      eventBus.off('AgentStarted', handleStarted);
      eventBus.off('AgentCompleted', handleCompleted);
    };
  }, []);

  // Simulate Swarm Loop
  useEffect(() => {
    let timer: any;
    if (isReplaying) {
      const sequence = ['monitoring', 'baseline', 'anomaly', 'rootcause', 'skeptic', 'impact', 'planner', 'supervisor'];
      
      const runNext = (stepIdx: number) => {
        if (stepIdx >= sequence.length) {
          setIsReplaying(false);
          setActiveStep(-1);
          return;
        }

        const agentId = sequence[stepIdx];
        setActiveStep(stepIdx);
        
        // Emit Event Bus Started
        eventBus.emit('AgentStarted', { agentId });

        timer = setTimeout(() => {
          // Emit Event Bus Completed
          eventBus.emit('AgentCompleted', { agentId });
          runNext(stepIdx + 1);
        }, 1500 / replaySpeed);
      };

      runNext(0);
    }

    return () => clearTimeout(timer);
  }, [isReplaying, replaySpeed]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <Cpu size={24} className="text-blue-650" /> Veilon Swarm Center
          </h1>
          <p className="text-slate-500 text-xs mt-1">Live Multi-Agent event bus topology, Skeptic hypothesis evaluations, and reasoning graphs</p>
        </div>

        {/* Replay Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setNodeStates({
                monitoring: 'idle', baseline: 'idle', anomaly: 'idle', rootcause: 'idle',
                skeptic: 'idle', impact: 'idle', planner: 'idle', supervisor: 'idle'
              });
              setIsReplaying(true);
            }}
            disabled={isReplaying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <Play size={12} /> Replay Incident
          </button>
          <select 
            value={replaySpeed}
            onChange={(e) => setReplaySpeed(Number(e.target.value))}
            className="bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value={1}>Speed: 1x</option>
            <option value={2}>Speed: 2x</option>
          </select>
        </div>
      </div>

      {/* Grid mapping */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 overflow-hidden h-[calc(100vh-170px)]">
        
        {/* SWARM MAP TOPOLOGY (Framer SVG) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl relative p-4 flex flex-col justify-between shadow-sm">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Swarm Coordination Topology</h2>
            <span className="text-[9px] font-mono bg-slate-50 px-2 py-0.5 border border-slate-250 text-slate-500 rounded-lg">Event-Driven Network</span>
          </div>

          <div className="flex-1 relative border border-slate-100 rounded-xl bg-slate-50/50 overflow-hidden min-h-[350px]">
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Connector Paths */}
              {SWARM_NODES.map((node, i) => {
                const nextNode = SWARM_NODES[(i + 1) % SWARM_NODES.length];
                return (
                  <g key={`link-${i}`}>
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke={nodeStates[node.id] === 'validated' ? '#22c55e' : '#cbd5e1'}
                      strokeWidth={nodeStates[node.id] === 'running' ? 2 : 1}
                      strokeDasharray={nodeStates[node.id] === 'running' ? '5,5' : 'none'}
                    />
                    {nodeStates[node.id] === 'running' && (
                      <circle r="3" fill="#2563eb">
                        <animateMotion
                          dur="1.2s"
                          repeatCount="indefinite"
                          path={`M ${node.x} ${node.y} L ${nextNode.x} ${nextNode.y}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Node shapes */}
              {SWARM_NODES.map((node) => {
                const state = nodeStates[node.id];
                let color = '#94a3b8'; // idle
                if (state === 'running') color = '#2563eb';
                if (state === 'validated') color = '#22c55e';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <motion.circle
                      r="16"
                      fill={color}
                      animate={state === 'running' ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="shadow-sm"
                    />
                    <text y="30" textAnchor="middle" className="text-[8px] font-bold fill-slate-700 font-mono">{node.name.split(' ')[0]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* SKEPTIC COMPARATOR DRAWER */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm overflow-y-auto">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-500" /> Skeptic Agent Verification
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-red-655 font-mono">Anomaly Claim</span>
                <p className="font-bold text-slate-800">{skepticData.rootCauseClaim}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-250 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-amber-700 font-mono">Skeptic Counter-Hypothesis</span>
                <p className="font-bold text-slate-855">{skepticData.skepticClaim}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{skepticData.evidence}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                <span>Agreement: {skepticData.agreement}%</span>
                <span>Disagreement: {skepticData.disagreement}%</span>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-1 mt-3">
                <span className="text-[9px] uppercase font-bold text-green-700 font-mono">Supervisor Consensus</span>
                <p className="text-[10px] text-slate-700 leading-relaxed">{skepticData.finalDecision}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default SwarmCenter;
