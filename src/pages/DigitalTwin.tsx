import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation, MachineStatus } from '../context/SimulationContext';
import { ZoomIn, ZoomOut, Move, RefreshCw } from 'lucide-react';

export const DigitalTwin: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useSimulation();

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map 20 machines onto a beautiful factory floor coordinate system
  const gridPositions = [
    { x: 120, y: 100 }, { x: 260, y: 100 }, { x: 400, y: 100 }, { x: 540, y: 100 }, { x: 680, y: 100 },
    { x: 120, y: 220 }, { x: 260, y: 220 }, { x: 400, y: 220 }, { x: 540, y: 220 }, { x: 680, y: 220 },
    { x: 120, y: 340 }, { x: 260, y: 340 }, { x: 400, y: 340 }, { x: 540, y: 340 }, { x: 680, y: 340 },
    { x: 120, y: 460 }, { x: 260, y: 460 }, { x: 400, y: 460 }, { x: 540, y: 460 }, { x: 680, y: 460 }
  ];

  // Live connections (source -> target machine index)
  const connections = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
    { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13 }, { from: 13, to: 14 },
    { from: 15, to: 16 }, { from: 16, to: 17 }, { from: 17, to: 18 }, { from: 18, to: 19 },
    { from: 0, to: 5 }, { from: 5, to: 10 }, { from: 10, to: 15 },
    { from: 4, to: 9 }, { from: 9, to: 14 }, { from: 14, to: 19 }
  ];

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).id === 'grid-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Digital Twin Topology Map</h1>
          <p className="text-slate-500 text-xs mt-1 font-sans">Full factory automation line layout including active network routing paths</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-55 text-slate-650 transition-colors shadow-sm" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.15))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-55 text-slate-650 transition-colors shadow-sm" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={resetView} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-55 text-slate-650 transition-colors shadow-sm" title="Reset View">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="flex-1 min-h-[500px] glass-card rounded-2xl relative overflow-hidden bg-slate-50 border border-slate-200">
        {/* Navigation Indicator Overlay */}
        <div className="absolute top-4 left-4 p-3 bg-white/90 border border-slate-200 rounded-xl flex items-center gap-2.5 z-10 text-[10px] font-bold text-slate-500 shadow-sm select-none">
          <Move size={14} className="text-blue-650" />
          <span>Click & Drag grid to Pan | Scroll / Button controls to Zoom</span>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3 bg-white/90 border border-slate-200 rounded-xl flex flex-col gap-2 z-10 text-[10px] font-bold shadow-sm select-none">
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-green-500 inline-block shadow shadow-green-200"></span> HEALTHY</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block shadow shadow-amber-200"></span> WARNING</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block shadow shadow-red-200"></span> CRITICAL</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block"></span> OFFLINE</span>
        </div>

        {/* Interactive SVG Canvas */}
        <svg 
          width="100%" 
          height="100%"
          className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Blueprint Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect id="grid-bg" width="100%" height="100%" fill="url(#grid)" />

          {/* Group containing all Zoom and Pan translations */}
          <g transform={`translate(${panX}, ${panY}) scale(${zoom})`} style={{ transition: 'transform 0.05s ease-out' }}>
            
            {/* Realistic Factory Floor Zones */}
            <g opacity="0.75" className="select-none">
              {/* Sector A - Line 1 */}
              <rect x="80" y="50" width="700" height="100" rx="12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />
              <text x="95" y="72" className="text-[9px] font-mono font-bold fill-slate-400 uppercase tracking-widest">Sector A - Assembly Line 1</text>

              {/* Sector B - Line 3 */}
              <rect x="80" y="170" width="700" height="100" rx="12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />
              <text x="95" y="192" className="text-[9px] font-mono font-bold fill-slate-400 uppercase tracking-widest">Sector B - Robotics Assembly Line 3</text>

              {/* Sector C - Line 2 */}
              <rect x="80" y="290" width="700" height="100" rx="12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />
              <text x="95" y="312" className="text-[9px] font-mono font-bold fill-slate-400 uppercase tracking-widest">Sector C - Conveyors & Packaging Line 2</text>

              {/* Utility Grid & Turbine Room */}
              <rect x="80" y="410" width="700" height="100" rx="12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />
              <text x="95" y="432" className="text-[9px] font-mono font-bold fill-slate-400 uppercase tracking-widest">Utility Grid & Turbine Core Hall</text>
            </g>

            {/* Live Connection Lines */}
            {connections.map((conn, idx) => {
              const start = gridPositions[conn.from];
              const end = gridPositions[conn.to];
              const mStart = machines[conn.from];
              const mEnd = machines[conn.to];

              if (!start || !end || !mStart || !mEnd) return null;

              // Color based on active node state
              const isOffline = mStart.status === 'offline' || mEnd.status === 'offline';
              const isCrit = mStart.status === 'critical' || mEnd.status === 'critical';
              const isWarn = mStart.status === 'warning' || mEnd.status === 'warning';
              
              let lineColor = 'rgba(37, 99, 235, 0.25)'; // Neutral blue
              let dashArray = '0';
              let dashSpeedClass = '';

              if (isOffline) {
                lineColor = 'rgba(148, 163, 184, 0.2)';
              } else if (isCrit) {
                lineColor = 'rgba(239, 68, 68, 0.5)';
                dashArray = '6, 6';
                dashSpeedClass = 'stroke-[2px]';
              } else if (isWarn) {
                lineColor = 'rgba(245, 158, 11, 0.45)';
                dashArray = '8, 8';
              } else {
                lineColor = 'rgba(34, 197, 94, 0.35)';
                dashArray = '10, 5';
              }

              return (
                <g key={`conn-${idx}`}>
                  <line 
                    x1={start.x} 
                    y1={start.y} 
                    x2={end.x} 
                    y2={end.y} 
                    stroke={lineColor}
                    strokeWidth={isCrit ? 2.5 : 1.5}
                    strokeDasharray={dashArray}
                    className={dashSpeedClass}
                  />
                  {/* Material Flow Particle Dot */}
                  {!isOffline && (
                    <circle r="3" fill="#2563EB" className="opacity-75">
                      <animateMotion
                        dur="3.2s"
                        repeatCount="indefinite"
                        path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Factory Machine Nodes */}
            {machines.map((node, index) => {
              const pos = gridPositions[index];
              if (!pos) return null;

              let nodeColor = '#22c55e'; // success
              let glow = 'node-glow-healthy';
              if (node.status === 'warning') {
                nodeColor = '#f59e0b';
                glow = 'node-glow-warning';
              } else if (node.status === 'critical') {
                nodeColor = '#ef4444';
                glow = 'node-glow-critical';
              } else if (node.status === 'offline') {
                nodeColor = '#94a3b8';
                glow = 'node-glow-offline';
              }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => navigate('/device-operations')}
                >
                  {/* Glowing background ring */}
                  <circle 
                    r="24" 
                    fill="transparent" 
                    stroke={nodeColor} 
                    strokeWidth="1.5" 
                    className={`opacity-15 group-hover:opacity-35 transition-all duration-300 ${glow}`}
                  />
                  {/* Main Node body */}
                  <rect 
                    x="-18" 
                    y="-18" 
                    width="36" 
                    height="36" 
                    rx="8" 
                    fill="#ffffff" 
                    stroke={nodeColor} 
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-105 shadow-sm"
                  />
                  
                  {/* Mini status indicator dot */}
                  <circle cx="10" cy="-10" r="4" fill={nodeColor} />

                  {/* Machine Text Code */}
                  <text 
                    textAnchor="middle" 
                    dy="4" 
                    className="fill-slate-700 text-[10px] font-black font-mono tracking-tighter"
                  >
                    {node.id.replace('DEV-', '')}
                  </text>

                  {/* HTML Hover Card Overlay */}
                  <foreignObject 
                    x="-70" 
                    y="25" 
                    width="140" 
                    height="100" 
                    className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
                  >
                    <div className="bg-white border border-slate-200 text-[9px] p-2 rounded-lg shadow-xl text-left text-slate-650">
                      <p className="font-extrabold text-slate-800 truncate">{node.name}</p>
                      <p className="text-slate-450 font-bold">{node.type}</p>
                      <div className="flex justify-between items-center mt-1 border-t border-slate-100 pt-1">
                        <span>Health:</span>
                        <span className="font-bold text-slate-800">{node.healthScore}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk:</span>
                        <span className={`font-bold ${
                          node.riskLevel === 'Low' ? 'text-green-600' : node.riskLevel === 'Medium' ? 'text-amber-500' : 'text-red-500'
                        }`}>{node.riskLevel}</span>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
