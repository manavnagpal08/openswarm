import React, { createContext, useContext, useState, useEffect } from 'react';
import { SwarmAgent, IncidentDBMemory, AgentResponse } from '../services/AgentOrchestrator';

export type MachineStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export interface MechanicalComponent {
  name: string;
  condition: 'Optimal' | 'Warning' | 'Critical' | 'Offline';
  failureProbability: number;
  explanation: string;
}

export interface TelemetryData {
  temperature: number;
  powerConsumption: number;
  pressure: number;
  humidity: number;
  vibration: number;
  runtime: number;
  latency?: number;
  errors?: number;
}

export interface Alert {
  id: string;
  severity: 'warning' | 'critical';
  deviceName: string;
  deviceId: string;
  issue: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

export interface MaintenanceTicket {
  id: string;
  machineId: string;
  machineName: string;
  issue: string;
  severity: 'warning' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredParts: string[];
  estimatedRepairTime: string;
  checklist: { task: string; completed: boolean }[];
  status: 'scheduled' | 'upcoming' | 'overdue' | 'completed';
  assignedDate: string;
  assignedEngineer: string;
  linkedReportPdf?: string | null;
}

export interface MachineNode {
  id: string;
  name: string;
  type: string;
  address: string;
  status: MachineStatus;
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastUpdated: string;
  telemetry: TelemetryData;
  components: MechanicalComponent[];
  rootCause: {
    mostLikelyCause: string;
    supportingMetrics: string;
    confidence: number;
    aiExplanation: string;
  };
  maintenance: {
    lastMaintenance: string;
    nextMaintenance: string;
    assignedEngineer: string;
    currentTicket: string | null;
  };
  governance: {
    approvalStatus: 'Approved' | 'Pending' | 'Rejected';
    rejectionReason: string | null;
    rejectedBy: string | null;
    rejectedTimestamp: string | null;
    linkedReportPdf: string | null;
  };
}

interface ChartPoint {
  time: string;
  temperature: number;
  powerConsumption: number;
  pressure: number;
  humidity: number;
  vibration: number;
}

interface SimulationContextProps {
  machines: MachineNode[];
  setMachines: React.Dispatch<React.SetStateAction<MachineNode[]>>;
  alerts: Alert[];
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  chartHistory: ChartPoint[];
  systemHealth: number;
  systemStats: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
    maintenanceDue: number;
  };
  triggerAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  resolveAlert: (alertId: string) => void;
  addTicket: (ticket: Omit<MaintenanceTicket, 'id'>) => void;
  toggleChecklistItem: (ticketId: string, taskIndex: number) => void;
  wsConnected: boolean;
  activeIncidentReport: any;
  setActiveIncidentReport: (val: any) => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

const INITIAL_MACHINES: MachineNode[] = Array.from({ length: 20 }, (_, idx) => {
  const idNum = idx + 1;
  const idStr = `DEV-${String(idNum).padStart(3, '0')}`;
  
  const types = ['Robotic Arm', 'CNC Mill', 'Conveyor Belt', 'Air Compressor', 'Industrial Turbine', 'Hydraulic Press'];
  const type = types[idx % types.length];
  
  const names = [
    'Robotic Arm Alpha', 'CNC Mill 2', 'Main Assembly Line', 'Heavy Compressor', 'Turbine Core A', 'Hydraulic Press X',
    'Robotic Welder Beta', 'Vaporizer Unit 4', 'Material Lifter 3', 'Cooling System B', 'Packaging sorter', 'CNC Lathe 1',
    'Conveyor Sector C', 'High pressure blower', 'Auxiliary Generator', 'Water Pump Alpha', 'Robot Packer Y', 'Exhaust Fan Beta',
    'Kiln Heater Core', 'Hydraulic Pump Unit'
  ];
  const name = names[idx] || `${type} ${idStr}`;

  const sectors = ['Sector A - Line 1', 'Sector B - Line 3', 'Sector A - Line 4', 'Sector C - Line 2', 'Sector D - Line 1'];
  const address = sectors[idx % sectors.length];

  // Distribute initial states
  let status: MachineStatus = 'healthy';
  let healthScore = 98 - (idx % 5) * 4;
  if (idNum === 5 || idNum === 14) {
    status = 'warning';
    healthScore = 72;
  } else if (idNum === 10) {
    status = 'critical';
    healthScore = 48;
  } else if (idNum === 18) {
    status = 'offline';
    healthScore = 0;
  }

  const riskLevel = status === 'healthy' ? 'Low' : status === 'warning' ? 'Medium' : status === 'critical' ? 'High' : 'Low';

  const baseTelemetry = {
    temperature: 45 + (idx % 6) * 6,
    powerConsumption: 120 + (idx % 5) * 50,
    pressure: 2.2 + (idx % 4) * 0.4,
    humidity: 35 + (idx % 3) * 10,
    vibration: 1.1 + (idx % 5) * 0.3,
    runtime: 1200 + idx * 240,
    latency: 14 + (idx % 5) * 2,
    errors: 0
  };

  const components: MechanicalComponent[] = [
    {
      name: 'Motor',
      condition: status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Optimal',
      failureProbability: status === 'critical' ? 42 : status === 'warning' ? 18 : 2,
      explanation: status === 'critical' ? 'Elevated micro-shocks detected on rear bearing rotor.' : 'Temperature has risen 8% over standard running baseline.',
    },
    {
      name: 'Cooling Fan',
      condition: 'Optimal',
      failureProbability: 1,
      explanation: 'Airflow intake is clear and fan RPM matches motor load demands.',
    },
    {
      name: 'Power Unit',
      condition: 'Optimal',
      failureProbability: 3,
      explanation: 'Voltage ripple is within safe 15mV tolerance threshold.',
    },
    {
      name: 'Sensor Board',
      condition: status === 'offline' ? 'Offline' : 'Optimal',
      failureProbability: status === 'offline' ? 100 : 0.5,
      explanation: status === 'offline' ? 'Connection link failed, unable to handshake telemetry board.' : 'Self-diagnostics reports 100% signal strength.',
    },
    {
      name: 'Hydraulic Pump',
      condition: 'Optimal',
      failureProbability: 4,
      explanation: 'Fluid level is 94% with standard output valve pressure.',
    }
  ];

  return {
    id: idStr,
    name,
    type,
    address,
    status,
    healthScore,
    riskLevel,
    lastUpdated: new Date().toLocaleTimeString(),
    telemetry: baseTelemetry,
    components,
    rootCause: {
      mostLikelyCause: status === 'critical' ? 'Bearing Degas & Lubrication Lockout' : status === 'warning' ? 'Coil Overheating' : 'N/A',
      supportingMetrics: status === 'critical' ? 'Vibration Level > 3.2mm/s, Rotor Temperature 84°C' : status === 'warning' ? 'Stator Temperature 67°C' : 'N/A',
      confidence: status === 'critical' ? 88 : status === 'warning' ? 64 : 0,
      aiExplanation: status === 'critical' 
        ? 'High frequency vibration amplitudes on the Z-axis suggest the inner bearing track is undergoing micro-fracturing due to high friction.' 
        : status === 'warning' 
        ? 'Thermal images show heat dissipation anomalies in the secondary coil housing.' 
        : 'System parameters operate normally.'
    },
    maintenance: {
      lastMaintenance: '2026-05-10',
      nextMaintenance: '2026-08-20',
      assignedEngineer: ['Marcus Vance', 'Sarah Connor', 'Alan Turing', 'Ada Lovelace'][idx % 4],
      currentTicket: status === 'critical' ? 'TKT-101' : status === 'warning' ? 'TKT-102' : null,
    },
    governance: {
      approvalStatus: status === 'critical' ? 'Pending' : 'Approved',
      rejectionReason: null,
      rejectedBy: null,
      rejectedTimestamp: null,
      linkedReportPdf: status === 'critical' ? 'REPORT-TKT-101' : null
    }
  };
});

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'TKT-101',
    machineId: 'DEV-010',
    machineName: 'Cooling System B',
    issue: 'Severe Rotor Vibration & Overheating',
    severity: 'critical',
    priority: 'urgent',
    requiredParts: ['Inner Bearing Ring Assembly', 'Silicone Grease', 'Rotor Fan Guard'],
    estimatedRepairTime: '2.5 Hours',
    checklist: [
      { task: 'Inspect Fan Blades', completed: false },
      { task: 'Replace Bearing Unit', completed: false },
      { task: 'Restart Machine & Re-align Shaft', completed: false },
      { task: 'Verify Telemetry Values', completed: false }
    ],
    status: 'overdue',
    assignedDate: '2026-07-16',
    assignedEngineer: 'Marcus Vance'
  },
  {
    id: 'TKT-102',
    machineId: 'DEV-005',
    machineName: 'Turbine Core A',
    issue: 'High Core Temperature & Fan Degradation',
    severity: 'warning',
    priority: 'medium',
    requiredParts: ['Dust Filter Pack', 'High Flow Stator Coil'],
    estimatedRepairTime: '1.2 Hours',
    checklist: [
      { task: 'Clear Airway Intakes', completed: true },
      { task: 'Replace Thermal Paste on Sensor Core', completed: false },
      { task: 'Run Fan Speed Calibration Test', completed: false }
    ],
    status: 'scheduled',
    assignedDate: '2026-07-18',
    assignedEngineer: 'Sarah Connor'
  }
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-201',
    severity: 'critical',
    deviceName: 'Cooling System B',
    deviceId: 'DEV-010',
    issue: 'Rotor Vibration reached critical threshold (3.4 mm/s)',
    timestamp: '2026-07-18 11:42:01',
    status: 'active'
  },
  {
    id: 'ALT-202',
    severity: 'warning',
    deviceName: 'Turbine Core A',
    deviceId: 'DEV-005',
    issue: 'Core Stator temperature exceeded threshold (68.4°C)',
    timestamp: '2026-07-18 11:58:30',
    status: 'active'
  }
];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<MachineNode[]>(INITIAL_MACHINES);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(true); // Simulated WebSockets Connection
  const [activeIncidentReport, setActiveIncidentReport] = useState<any>(null);

  // Seed chart initial history
  useEffect(() => {
    const data: ChartPoint[] = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 1000);
      data.push({
        time: t.toLocaleTimeString(),
        temperature: 55 + Math.sin(i * 0.4) * 5,
        powerConsumption: 240 + Math.cos(i * 0.3) * 20,
        pressure: 2.8 + Math.sin(i * 0.5) * 0.3,
        humidity: 45 + Math.cos(i * 0.2) * 4,
        vibration: 1.5 + Math.sin(i * 0.7) * 0.2,
      });
    }
    setChartHistory(data);
  }, []);

  // Simulation Tick (Simulated WebSockets Telemetry Frame Stream)
  useEffect(() => {
    const timer = setInterval(() => {
      setMachines(prevMachines =>
        prevMachines.map((m, idx) => {
          if (m.status === 'offline') {
            return {
              ...m,
              lastUpdated: new Date().toLocaleTimeString(),
              telemetry: { ...m.telemetry, latency: 999, errors: 1 }
            };
          }

          // Fluctuating values simulating active WebSocket stream frame
          const timeSec = Date.now() / 10000;
          const targetTemp = 74 + Math.sin(timeSec + idx) * 2;
          const targetPower = 230 + Math.cos(timeSec * 0.8 + idx) * 5;
          const targetPressure = 3.2 + Math.sin(timeSec * 1.2 + idx) * 0.15;
          const targetHumidity = 42.5 + Math.cos(timeSec * 0.5 + idx) * 2;
          const targetVibration = 2.35 + Math.sin(timeSec * 1.5 + idx) * 0.25;

          // occasional anomaly spikes when device is critical
          const isCritical = m.status === 'critical';
          const updatedTelemetry = {
            temperature: isCritical ? 95.2 : targetTemp,
            powerConsumption: isCritical ? 385 : targetPower,
            pressure: isCritical ? 1.4 : targetPressure,
            humidity: targetHumidity,
            vibration: isCritical ? 4.85 : targetVibration,
            runtime: m.telemetry.runtime + 1 / 3600,
            latency: Math.round(10 + Math.random() * 8),
            errors: isCritical ? 4 : 0
          };

          // Update health based on parameters
          let healthScore = m.healthScore;
          let status = m.status;

          // Critical triggers
          if (updatedTelemetry.temperature > 85 || updatedTelemetry.vibration > 3.0) {
            status = 'critical';
            healthScore = Math.max(10, Math.min(50, healthScore - 1));
          } else if (updatedTelemetry.temperature > 65 || updatedTelemetry.vibration > 2.0) {
            status = 'warning';
            healthScore = Math.max(51, Math.min(79, healthScore - 0.5));
          } else {
            status = 'healthy';
            healthScore = Math.min(99, healthScore + 0.2);
          }

          // Force updates on component details to correspond
          const components = m.components.map(comp => {
            if (comp.name === 'Motor') {
              return {
                ...comp,
                condition: (status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Optimal') as 'Optimal' | 'Warning' | 'Critical' | 'Offline',
                failureProbability: Math.round(100 - healthScore),
              };
            }
            return comp;
          });

          return {
            ...m,
            status,
            healthScore: Math.round(healthScore),
            riskLevel: status === 'healthy' ? 'Low' : status === 'warning' ? 'Medium' : status === 'critical' ? 'High' : 'Low',
            telemetry: updatedTelemetry,
            components,
            lastUpdated: new Date().toLocaleTimeString()
          };
        })
      );

      // Add points to chart history
      setChartHistory(prevHistory => {
        const timeNow = new Date().toLocaleTimeString();
        const activeMachines = machines.filter(m => m.status !== 'offline');
        if (activeMachines.length === 0) return prevHistory;

        const avgTemp = activeMachines.reduce((a, b) => a + b.telemetry.temperature, 0) / activeMachines.length;
        const avgPower = activeMachines.reduce((a, b) => a + b.telemetry.powerConsumption, 0) / activeMachines.length;
        const avgPress = activeMachines.reduce((a, b) => a + b.telemetry.pressure, 0) / activeMachines.length;
        const avgHumid = activeMachines.reduce((a, b) => a + b.telemetry.humidity, 0) / activeMachines.length;
        const avgVib = activeMachines.reduce((a, b) => a + b.telemetry.vibration, 0) / activeMachines.length;

        const newPoint: ChartPoint = {
          time: timeNow,
          temperature: Math.round(avgTemp * 10) / 10,
          powerConsumption: Math.round(avgPower),
          pressure: Math.round(avgPress * 100) / 100,
          humidity: Math.round(avgHumid * 10) / 10,
          vibration: Math.round(avgVib * 100) / 100,
        };

        const trimmed = prevHistory.length >= 20 ? prevHistory.slice(1) : prevHistory;
        return [...trimmed, newPoint];
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [machines]);

  // Aggregate stats
  const activeCount = machines.filter(m => m.status !== 'offline').length;
  const systemHealth = activeCount > 0 
    ? Math.round(machines.filter(m => m.status !== 'offline').reduce((a, b) => a + b.healthScore, 0) / activeCount)
    : 0;

  const systemStats = {
    total: machines.length,
    healthy: machines.filter(m => m.status === 'healthy').length,
    warning: machines.filter(m => m.status === 'warning').length,
    critical: machines.filter(m => m.status === 'critical').length,
    offline: machines.filter(m => m.status === 'offline').length,
    maintenanceDue: tickets.filter(t => t.status === 'overdue' || t.status === 'scheduled').length,
  };

  const triggerAlert = (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
  };

  const addTicket = (ticket: Omit<MaintenanceTicket, 'id'>) => {
    const newTicket: MaintenanceTicket = {
      ...ticket,
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const toggleChecklistItem = (ticketId: string, taskIndex: number) => {
    setTickets(prevTickets =>
      prevTickets.map(t => {
        if (t.id !== ticketId) return t;
        const newChecklist = t.checklist.map((item, idx) =>
          idx === taskIndex ? { ...item, completed: !item.completed } : item
        );
        const allDone = newChecklist.every(item => item.completed);
        const status = allDone ? 'completed' : t.status;

        if (allDone) {
          setMachines(prevMachines =>
            prevMachines.map(m => {
              if (m.id === t.machineId) {
                return {
                  ...m,
                  status: 'healthy',
                  healthScore: 98,
                  riskLevel: 'Low',
                  components: m.components.map(c => ({ ...c, condition: 'Optimal', failureProbability: 1 })),
                  maintenance: {
                    ...m.maintenance,
                    lastMaintenance: new Date().toISOString().split('T')[0],
                    currentTicket: null
                  },
                  governance: {
                    approvalStatus: 'Approved',
                    rejectionReason: null,
                    rejectedBy: null,
                    rejectedTimestamp: null,
                    linkedReportPdf: null
                  }
                };
              }
              return m;
            })
          );
        }

        return {
          ...t,
          checklist: newChecklist,
          status
        };
      })
    );
  };

  return (
    <SimulationContext.Provider
      value={{
        machines,
        setMachines,
        alerts,
        tickets,
        setTickets,
        chartHistory,
        systemHealth,
        systemStats,
        triggerAlert,
        resolveAlert,
        addTicket,
        toggleChecklistItem,
        wsConnected,
        activeIncidentReport,
        setActiveIncidentReport
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
