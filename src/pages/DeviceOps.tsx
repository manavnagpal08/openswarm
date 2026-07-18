import React, { useState } from 'react';
import { useSimulation, MachineNode } from '../context/SimulationContext';
import { 
  Cpu, Thermometer, BatteryCharging, Gauge, Zap, SlidersHorizontal, Info, Play, RefreshCw, X, Radio, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DeviceOps: React.FC = () => {
  const { machines, setMachines } = useSimulation();
  
  const [selectedId, setSelectedId] = useState<string>('DEV-010');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('health');

  const device = machines.find(m => m.id === selectedId) || machines[0];

  // Filtering and Sorting
  const filteredDevices = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'health') return a.healthScore - b.healthScore;
    if (sortBy === 'risk') {
      const riskMap = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      return riskMap[b.riskLevel] - riskMap[a.riskLevel];
    }
    return a.name.localeCompare(b.name);
  });

  // Mock exploded component parameters generator
  const getExplodedComponents = (node: MachineNode) => {
    const isNodeCritical = node.status === 'critical';
    return [
      { name: 'Motor Assembly', health: isNodeCritical ? 34 : 98, temp: isNodeCritical ? 88 : 42, remainingHours: isNodeCritical ? 140 : 4200, status: isNodeCritical ? 'Critical' : 'Optimal' },
      { name: 'Cooling Fan Guard', health: isNodeCritical ? 12 : 99, temp: isNodeCritical ? 92 : 38, remainingHours: isNodeCritical ? 24 : 6000, status: isNodeCritical ? 'Critical' : 'Optimal' },
      { name: 'Sensor Array Board', health: 96, temp: 35, remainingHours: 8500, status: 'Optimal' },
      { name: 'Power Converter Unit', health: 97, temp: 40, remainingHours: 12000, status: 'Optimal' },
      { name: 'Controller Hub Core', health: 98, temp: 37, remainingHours: 15000, status: 'Optimal' },
      { name: 'Rotor Ball Bearing', health: isNodeCritical ? 22 : 94, temp: isNodeCritical ? 82 : 44, remainingHours: isNodeCritical ? 120 : 3800, status: isNodeCritical ? 'Critical' : 'Optimal' },
      { name: 'Hydraulic Pumping Valve', health: 99, temp: 32, remainingHours: 18000, status: 'Optimal' }
    ];
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      
      {/* LEFT COLUMN: DEVICES GRID VIEW */}
      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[60vh] xl:h-[calc(100vh-170px)] overflow-hidden shadow-sm">
        
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">Monitored Devices Index</h2>
            <span className="text-[10px] font-mono text-slate-400 font-bold">{filteredDevices.length} Nodes</span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-250 rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-white border border-slate-250 text-[10px] text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="healthy">Healthy</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-white border border-slate-250 text-[10px] text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="health">Sort: Health</option>
              <option value="risk">Sort: Risk</option>
            </select>
          </div>
        </div>

        {/* Scrolling Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDevices.map(m => {
            const isSelected = m.id === selectedId;
            
            // Risk colors mapping
            let riskBadgeColor = 'bg-green-50 text-green-700 border border-green-200';
            if (m.riskLevel === 'Medium') riskBadgeColor = 'bg-amber-50 text-amber-700 border border-amber-200';
            if (m.riskLevel === 'High') riskBadgeColor = 'bg-orange-50 text-orange-700 border border-orange-200';
            if (m.riskLevel === 'Critical') riskBadgeColor = 'bg-red-50 text-red-655 border border-red-200';

            return (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/20 shadow-md scale-[1.01]' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 truncate">{m.name}</h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{m.id} | {m.type}</span>
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${riskBadgeColor}`}>
                    {m.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                  <div>
                    <span className="text-slate-400">Health:</span>
                    <p className="text-slate-700 font-bold">{m.healthScore}%</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Temp:</span>
                    <p className="text-slate-700 font-bold">{Math.round(m.telemetry.temperature)}°C</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Link:</span>
                    <p className="text-green-600 font-bold flex items-center gap-1"><Radio size={10} className="animate-pulse" /> Live</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT 2 COLUMNS: DETAILED exploded ANATOMY VIEW */}
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col min-h-[60vh] xl:h-[calc(100vh-170px)] overflow-y-auto p-5 space-y-6 shadow-sm">
        
        {/* Cockpit header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">{device.name}</h2>
              <span className="text-[9px] font-mono bg-slate-50 px-2 py-0.5 border border-slate-250 text-slate-500 rounded-lg">{device.id}</span>
            </div>
            <p className="text-slate-500 text-[10px] mt-1 font-mono">Location: {device.address} | Type: {device.type}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase font-bold text-slate-400">Health</span>
              <span className="text-xs font-black font-mono text-blue-600">{device.healthScore}%</span>
            </div>
          </div>
        </div>

        {/* Live meters gauges section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Cpu size={14} className="text-blue-600 animate-spin" style={{ animationDuration: '6s' }} /> Live Components Exploded Layout
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getExplodedComponents(device).map((comp, idx) => {
              const isCrit = comp.status === 'Critical';
              
              return (
                <motion.div
                  key={idx}
                  animate={isCrit ? { scale: [1, 1.015, 1], borderColor: ['#ef4444', '#fecaca', '#ef4444'] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 bg-slate-50/50 ${
                    isCrit ? 'border-red-500 bg-red-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-800">{comp.name}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isCrit ? 'bg-red-50 text-red-655 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>Condition Health:</span>
                      <span className="text-slate-800 font-bold">{comp.health}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span className="text-slate-800 font-bold">{comp.temp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Life:</span>
                      <span className={`font-bold ${isCrit ? 'text-red-655' : 'text-slate-700'}`}>{comp.remainingHours} Hrs</span>
                    </div>
                  </div>

                  {/* Component health progress line */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isCrit ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${comp.health}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
