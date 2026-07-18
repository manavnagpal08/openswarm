import React, { useState } from 'react';
import { useSimulation, MachineNode } from '../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, XOctagon, Cpu, Search, HelpCircle, FileText, Check, ArrowRight 
} from 'lucide-react';

export const ExplainableAi: React.FC = () => {
  const { machines } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string>('DEV-010');
  const [activeReasoningStage, setActiveReasoningStage] = useState<string>('sensor');

  // Filter machines
  const filtered = machines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDevice = machines.find(m => m.id === selectedId) || machines[0];
  const isDevCritical = currentDevice.status === 'critical';

  // Mock reasoning details
  const decisionJourney = [
    { agent: 'Monitoring Agent', input: 'Raw 5-channel sensor frames at 1Hz.', analysis: 'Parsed Temp, Press, Power, Humid, Vib.', output: `Ingested nominal signals. Current Temp: ${Math.round(currentDevice.telemetry.temperature)}°C.`, confidence: 99, time: 0.1 },
    { agent: 'Baseline Agent', input: 'Telemetry history arrays.', analysis: 'Compared against 30-day baseline moving averages.', output: isDevCritical ? 'Detected 18.4% drift in Thermal/Vibration signals.' : 'No drift detected within safe baseline bands.', confidence: 98, time: 0.2 },
    { agent: 'Anomaly Agent', input: 'Signal drift reports.', analysis: 'Evaluated signature patterns against anomaly templates.', output: isDevCritical ? 'Anomaly Classified: Critical Thermal Runaway.' : 'Nominal operations verified.', confidence: 96, time: 0.3 },
    { agent: 'Root Cause Agent', input: 'Anomaly signatures.', analysis: 'Mapped component metrics and sensor cross-correlations.', output: isDevCritical ? 'Isolated stator cooling fan guard blockage.' : 'N/A', confidence: 88, time: 0.4 },
    { agent: 'Impact Agent', input: 'Root cause + line buffer levels.', opacity: 0.9, analysis: 'Predicted downstream line blockages.', output: isDevCritical ? 'High Risk: 2.2 hrs estimated downtime.' : 'No impact predicted.', confidence: 92, time: 0.3 },
    { agent: 'Skeptic Agent', input: 'Primary root cause conclusions.', analysis: 'Challenged root cause with alternative bearing friction models.', output: isDevCritical ? '82% agreement with cooling fan fault hypothesis.' : 'Agree with normal baseline.', confidence: 91, time: 0.5 },
    { agent: 'Planner Agent', input: 'Consensus diagnosis payload.', analysis: 'Matched ticket checklists and engineer schedule logs.', output: isDevCritical ? 'Created workorder ticket with stator replacement tasks.' : 'N/A', confidence: 94, time: 0.2 },
    { agent: 'Supervisor Agent', input: 'Planner ticket drafts.', analysis: 'Validated security signatures and consensus thresholds.', output: isDevCritical ? 'Consensus approved. Maintenance scheduled.' : 'Nominal verified.', confidence: 97, time: 0.1 }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <HelpCircle size={24} className="text-blue-600 animate-pulse" /> Explainable AI Module
        </h1>
        <p className="text-slate-500 text-xs mt-1">Audit multi-agent reasoning trails, threshold deviations, and counter-hypotheses</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 overflow-hidden h-[calc(100vh-170px)]">
        
        {/* LEFT COLUMN: Monitored Devices selection */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col p-4 shadow-sm overflow-hidden h-full">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Device Audit Index</h2>
          
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.map(m => {
              const isSelected = m.id === selectedId;
              let statusColor = 'bg-green-500';
              if (m.status === 'warning') statusColor = 'bg-amber-500';
              if (m.status === 'critical') statusColor = 'bg-red-500';
              if (m.status === 'offline') statusColor = 'bg-slate-400';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected ? 'border-blue-500 bg-blue-50/10 shadow-sm' : 'border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-800">{m.name}</span>
                    <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                    <span>ID: {m.id}</span>
                    <span>Health: {m.healthScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: EXPLAINABLE WORKFLOWS */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-y-auto p-5 space-y-6 shadow-sm">
          
          {/* Header cockpit */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-850">{currentDevice.name}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Location: {currentDevice.address} | Device Type: {currentDevice.type}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Consensus Confidence</span>
              <span className="text-xs font-black text-blue-600 font-mono">{isDevCritical ? '93%' : '98%'}</span>
            </div>
          </div>

          {/* Visual Reasoning Flow Diagram */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">AI Reasoning flow</h3>
            <div className="grid grid-cols-6 gap-2 items-center text-center">
              {[
                { id: 'sensor', label: 'Sensor Data' },
                { id: 'pattern', label: 'Pattern Match' },
                { id: 'analysis', label: 'AI Analysis' },
                { id: 'rootcause', label: 'Root Cause' },
                { id: 'confidence', label: 'Confidence' },
                { id: 'decision', label: 'Final Decision' }
              ].map((stage, idx) => {
                const isActive = activeReasoningStage === stage.id;
                return (
                  <React.Fragment key={stage.id}>
                    <div
                      onClick={() => setActiveReasoningStage(stage.id)}
                      className={`p-2.5 rounded-xl border text-[9px] font-bold uppercase cursor-pointer transition-all ${
                        isActive ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {stage.label}
                    </div>
                    {idx < 5 && <ArrowRight size={12} className="text-slate-300 justify-self-center" />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Clickable stage explanations drawer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mt-3 text-xs text-slate-650 leading-relaxed font-mono">
              {activeReasoningStage === 'sensor' && (
                <p><strong>[Sensor Stage]:</strong> Ingesting continuous sines: Temp ({Math.round(currentDevice.telemetry.temperature)}°C) and Vibration ({currentDevice.telemetry.vibration}mm/s). Evaluated against nominal 30-day baseline arrays.</p>
              )}
              {activeReasoningStage === 'pattern' && (
                <p><strong>[Pattern Match]:</strong> {isDevCritical ? 'Thermal runaway signature detected. Signal deviation rate exceeds 18% variance bounds.' : 'Signals match normal Gaussian baseline bounds.'}</p>
              )}
              {activeReasoningStage === 'analysis' && (
                <p><strong>[AI Analysis]:</strong> {isDevCritical ? 'Monitoring, Baseline and Anomaly agents isolated DEV-010. Triggered critical alarm state.' : 'System nominal. Baseline variance verified within safe limits.'}</p>
              )}
              {activeReasoningStage === 'rootcause' && (
                <p><strong>[Root Cause]:</strong> {isDevCritical ? 'Isolated stator cooling guard blockage. High temperature spikes trigger secondary rotor thermal expansion.' : 'N/A'}</p>
              )}
              {activeReasoningStage === 'confidence' && (
                <p><strong>[Confidence]:</strong> Agent confidence index computed at {isDevCritical ? '93%' : '98%'}. Skeptic agent counters matched standard model.</p>
              )}
              {activeReasoningStage === 'decision' && (
                <p><strong>[Final Decision]:</strong> {isDevCritical ? 'Supervisor approved maintenance order. Scheduled ticket to dispatch Vance for stator guard overhaul.' : 'Maintain status quo monitoring.'}</p>
              )}
            </div>
          </div>

          {/* AI Decision Journey agent details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Multi-Agent Journey Trail</h3>
            <div className="space-y-3">
              {decisionJourney.map((step, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{step.agent}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Input: {step.input} | Output: {step.output}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <div>Confidence: {step.confidence}%</div>
                    <div>Time: {step.time}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ExplainableAi;
