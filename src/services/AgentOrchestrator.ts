export interface SwarmTool {
  name: string;
  description: string;
  execute: (args: any) => any;
}

export interface AgentResponse {
  agentName: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  confidence: number;
  reasoning: string;
  supportingMetrics: string;
  handoffPayload: any;
}

export interface IncidentRecord {
  incidentId: string;
  deviceId: string;
  deviceName: string;
  metrics: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
  rootCause: string;
  engineerAssigned: string;
  ticketId: string;
  status: 'active' | 'resolved';
  timestamp: string;
}

// 1. TOOL REGISTRY IMPLEMENTATION
export const MonitoringTool: SwarmTool = {
  name: 'MonitoringTool',
  description: 'Normalize raw sensor telemetry logs.',
  execute: (rawTelemetry: any) => {
    return {
      tempNormalized: Math.round(rawTelemetry.temperature * 10) / 10,
      vibrationNormalized: Math.round(rawTelemetry.vibration * 100) / 100,
      pressureNormalized: Math.round(rawTelemetry.pressure * 100) / 100,
      latencyMs: Math.round(15 + Math.random() * 10),
      errorCount: Math.random() > 0.95 ? 1 : 0
    };
  }
};

export const PlannerTool: SwarmTool = {
  name: 'PlannerTool',
  description: 'Create preventative and corrective maintenance tickets.',
  execute: (args: { deviceId: string; cause: string }) => {
    const ticketId = `TKT-${Math.floor(200 + Math.random() * 800)}`;
    const engineers = ['Marcus Vance', 'Sarah Connor', 'Alan Turing', 'Ada Lovelace'];
    const assignedEngineer = engineers[Math.floor(Math.random() * engineers.length)];
    return {
      ticketId,
      assignedEngineer,
      checklist: [
        'Isolate device power safety lockout',
        `Inspect and replace faulty modules: ${args.cause}`,
        'Recalibrate telemetric sensors',
        'Handshake telemetry with supervisor'
      ],
      nextMaintenanceDate: '2026-07-22'
    };
  }
};

export const AnalyticsTool: SwarmTool = {
  name: 'AnalyticsTool',
  description: 'Calculate overall plant health scores and warning indexes.',
  execute: (machines: any[]) => {
    const active = machines.filter(m => m.status !== 'offline');
    if (active.length === 0) return 0;
    return Math.round(active.reduce((acc, m) => acc + m.healthScore, 0) / active.length);
  }
};

export const SearchDeviceTool: SwarmTool = {
  name: 'SearchDeviceTool',
  description: 'Resolve machine layout details and locations.',
  execute: (args: { deviceId: string; machines: any[] }) => {
    return args.machines.find(m => m.id === args.deviceId) || null;
  }
};

// 2. INCIDENT MEMORY DATABASE
class IncidentMemoryDatabase {
  private records: IncidentRecord[] = [];

  constructor() {
    // Seed initial incident
    this.records.push({
      incidentId: 'INC-24001',
      deviceId: 'DEV-010',
      deviceName: 'Cooling System B',
      metrics: { temperature: 86.4, vibration: 3.4, pressure: 2.8 },
      rootCause: 'Cooling Fan Mechanical Failure',
      engineerAssigned: 'Marcus Vance',
      ticketId: 'TKT-101',
      status: 'active',
      timestamp: '2026-07-18 11:42:01'
    });
  }

  public addRecord(record: IncidentRecord) {
    this.records = [record, ...this.records];
  }

  public getRecords() {
    return this.records;
  }

  public getRecordById(id: string) {
    return this.records.find(r => r.incidentId === id) || null;
  }
}
export const IncidentDBMemory = new IncidentMemoryDatabase();

// 3. OPENSWARM AGENT CONFIGURATOR
export class SwarmAgent {
  public name: string;
  public systemPrompt: string;
  public tools: SwarmTool[];

  constructor(name: string, systemPrompt: string, tools: SwarmTool[]) {
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.tools = tools;
  }

  public execute(inputPayload: any): AgentResponse {
    // Structured logic simulating OpenAI Swarm Agent reasoning and output format
    switch (this.name) {
      case 'Monitoring Agent': {
        const normalized = MonitoringTool.execute(inputPayload.telemetry);
        const device = inputPayload.device;
        const hasAnomaly = normalized.tempNormalized > 80 || normalized.vibrationNormalized > 2.8;

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 99,
          reasoning: `Telemetry stream ingested for device ${device.id}. Values are temperature: ${normalized.tempNormalized}°C, vibration: ${normalized.vibrationNormalized}mm/s.`,
          supportingMetrics: `Temp: ${normalized.tempNormalized}°C, Vib: ${normalized.vibrationNormalized}mm/s`,
          handoffPayload: {
            deviceId: device.id,
            deviceName: device.name,
            metrics: normalized,
            hasAnomaly
          }
        };
      }

      case 'Baseline Learning Agent': {
        const { deviceId, metrics, hasAnomaly } = inputPayload;
        const deviationVal = hasAnomaly ? 24.5 : 2.1;
        const statusResult = hasAnomaly ? 'Critical' : 'Normal';

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 95,
          reasoning: `Compared metrics with historical 30-day baseline. Device ${deviceId} exhibits deviation rate of ${deviationVal}% which crosses nominal thresholds.`,
          supportingMetrics: `Deviation: ${deviationVal}%, Status: ${statusResult}`,
          handoffPayload: {
            ...inputPayload,
            deviation: deviationVal,
            statusResult
          }
        };
      }

      case 'Anomaly Detection Agent': {
        const { deviceId, deviceName, statusResult, metrics } = inputPayload;
        const isAnom = statusResult === 'Critical';

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 96,
          reasoning: isAnom 
            ? `Anomaly registered on device ${deviceId} (${deviceName}) based on deviation checks. Classifying anomaly severity to Critical.`
            : `Device parameters within normal bounds. No anomalies registered.`,
          supportingMetrics: `Severity: ${isAnom ? 'Critical' : 'Nominal'}, Affected: ${deviceId}`,
          handoffPayload: {
            ...inputPayload,
            severity: isAnom ? 'Critical' : 'Low',
            incidentId: `INC-${Math.floor(24000 + Math.random() * 900)}`
          }
        };
      }

      case 'Root Cause Agent': {
        const { deviceId, metrics } = inputPayload;
        const cause = metrics.tempNormalized > 80 ? 'Cooling Fan Mechanical Failure' : 'Bearing Degas & Lubrication Lockout';
        
        return {
          agentName: this.name,
          status: 'completed',
          confidence: 94,
          reasoning: `Correlated temp ${metrics.tempNormalized}°C and vibration ${metrics.vibrationNormalized}mm/s. High friction on Rotor shaft suggests bearing breakdown.`,
          supportingMetrics: `Fault Signature: Temp/Vib Imbalance, Cause: ${cause}`,
          handoffPayload: {
            ...inputPayload,
            rootCause: cause,
            explanation: `Vibrations exceed safety limits. Thermals suggest dissipation failure.`
          }
        };
      }

      case 'Impact Prediction Agent': {
        const { deviceId } = inputPayload;
        const downtime = 22;
        const risk = 'High';

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 91,
          reasoning: `Analyzed plant topology line maps. Failure of device ${deviceId} will create bottle-necks on sorter conveyor Line B.`,
          supportingMetrics: `Downtime: ${downtime} Mins, Risk: ${risk}`,
          handoffPayload: {
            ...inputPayload,
            downtime,
            riskLevel: risk,
            productionImpact: 'Line B sorter buffer overflow risk'
          }
        };
      }

      case 'Planner Agent': {
        const { deviceId, deviceName, rootCause } = inputPayload;
        const plannerResult = PlannerTool.execute({ deviceId, cause: rootCause });

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 98,
          reasoning: `Planner dispatched workorder ${plannerResult.ticketId} assigned to ${plannerResult.assignedEngineer}. Preventive lockout checklist generated.`,
          supportingMetrics: `Ticket: ${plannerResult.ticketId}, Engineer: ${plannerResult.assignedEngineer}`,
          handoffPayload: {
            ...inputPayload,
            ticketId: plannerResult.ticketId,
            engineer: plannerResult.assignedEngineer,
            checklist: plannerResult.checklist
          }
        };
      }

      case 'Supervisor Agent': {
        const { incidentId, deviceId, deviceName, metrics, rootCause, ticketId, engineer } = inputPayload;
        
        // Log final incident to memory
        const newRecord: IncidentRecord = {
          incidentId,
          deviceId,
          deviceName,
          metrics: {
            temperature: metrics.tempNormalized,
            vibration: metrics.vibrationNormalized,
            pressure: metrics.pressureNormalized
          },
          rootCause,
          engineerAssigned: engineer,
          ticketId,
          status: 'active',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        IncidentDBMemory.addRecord(newRecord);

        return {
          agentName: this.name,
          status: 'completed',
          confidence: 99,
          reasoning: `Reviewed all 6 agent diagnostic sheets. Tools handshake checks succeeded. Confirmed ticket ${ticketId} is logged in database.`,
          supportingMetrics: `Incident status: Logged, Report: INC-COMPLETE`,
          handoffPayload: {
            ...inputPayload,
            summaryReport: `Incident resolved successfully. Scheduler task created for ${engineer}.`
          }
        };
      }

      default:
        return {
          agentName: this.name,
          status: 'failed',
          confidence: 0,
          reasoning: 'Unknown agent model.',
          supportingMetrics: '',
          handoffPayload: null
        };
    }
  }
}

// 4. REPORT EXPORTERS
export const handleReportExport = (type: 'PDF' | 'CSV' | 'JSON', data: any) => {
  const fileContent = JSON.stringify(data, null, 2);
  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sentinel_summary_report.${type.toLowerCase()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
