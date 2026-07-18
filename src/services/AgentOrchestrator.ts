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

// ── PDF Generator via styled print popup ──────────────────────────────────────
const buildPdfHtml = (data: any): string => {
  const now = new Date().toLocaleString();
  const rows = Object.entries(data)
    .map(([k, v]) => {
      const key = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `<tr><td>${key}</td><td><strong>${v ?? '—'}</strong></td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Veilon Maintenance Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 13px; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 28px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #2563eb, #4f46e5); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .brand-icon svg { width: 22px; height: 22px; fill: #fff; }
    .brand-name { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub  { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .meta { text-align: right; font-size: 10px; color: #64748b; line-height: 1.8; }
    .meta .report-id { font-size: 13px; font-weight: 700; color: #2563eb; }

    /* Status badge */
    .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #dcfce7; color: #166534; border: 1px solid #86efac; margin-bottom: 20px; }

    /* Section title */
    .section-title { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }

    /* Data table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    tr { border-bottom: 1px solid #f1f5f9; }
    tr:last-child { border-bottom: none; }
    td { padding: 9px 12px; font-size: 12px; }
    td:first-child { color: #64748b; width: 40%; font-weight: 500; }
    td:last-child { color: #0f172a; }
    tbody tr:nth-child(odd) { background: #f8fafc; }

    /* AI confidence bar */
    .conf-bar { height: 6px; border-radius: 100px; background: #e2e8f0; margin-top: 4px; }
    .conf-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #2563eb, #10b981); }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }

    /* Print */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }

    /* Print button */
    .print-btn { display: block; margin: 0 auto 28px; padding: 10px 28px; background: linear-gradient(135deg,#2563eb,#4f46e5); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:0.3px; }
    .print-btn:hover { opacity: 0.92; }
  </style>
</head>
<body>
<div class="page">

  <!-- Print Button (hidden when printing) -->
  <button class="print-btn no-print" onclick="window.print()">⬇ Save / Print PDF</button>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
      </div>
      <div>
        <div class="brand-name">Veilon</div>
        <div class="brand-sub">AI Operations Platform</div>
      </div>
    </div>
    <div class="meta">
      <div class="report-id">${data.reportId || 'RPT-' + Date.now()}</div>
      <div>Generated: ${now}</div>
      <div>Classification: INTERNAL — CONFIDENTIAL</div>
      <div>Facility: FAC-DETROIT-02</div>
    </div>
  </div>

  <div class="badge">✓ Maintenance Completed &amp; Verified</div>

  <div class="section-title">Incident Summary</div>
  <table>
    <tbody>
      <tr><td>Incident ID</td><td><strong>${data.incidentId || '—'}</strong></td></tr>
      <tr><td>Device ID</td><td><strong>${data.deviceId || '—'}</strong></td></tr>
      <tr><td>Device Name</td><td><strong>${data.deviceName || '—'}</strong></td></tr>
      <tr><td>Device Type</td><td>${data.deviceType || 'Industrial Module'}</td></tr>
      <tr><td>Assigned Engineer</td><td>${data.engineerName || '—'}</td></tr>
      <tr><td>Maintenance Date</td><td>${data.maintenanceDate || '—'}</td></tr>
      <tr><td>Completion Time</td><td>${data.completionTime || now}</td></tr>
    </tbody>
  </table>

  <div class="section-title">Technical Analysis</div>
  <table>
    <tbody>
      <tr><td>Root Cause</td><td>${data.rootCauseAnalysis || '—'}</td></tr>
      <tr><td>Expected Downtime</td><td>${data.expectedDowntime || '—'}</td></tr>
      <tr><td>Actual Downtime</td><td>${data.actualDowntime || '—'}</td></tr>
      <tr><td>Components Replaced</td><td>${data.componentsReplaced || 'None'}</td></tr>
      <tr><td>Sensor Readings Before</td><td>${data.sensorReadingsBefore || '—'}</td></tr>
      <tr><td>Sensor Readings After</td><td>${data.sensorReadingsAfter || '—'}</td></tr>
    </tbody>
  </table>

  <div class="section-title">AI Prediction Confidence</div>
  <table>
    <tbody>
      <tr>
        <td>Prediction Accuracy</td>
        <td>
          <strong>${data.aiConfidence || 0}%</strong>
          <div class="conf-bar"><div class="conf-fill" style="width:${data.aiConfidence || 0}%"></div></div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Veilon AI Operations Platform · v2.4.0-LTS</span>
    <span>Report generated by AI Swarm — ${now}</span>
    <span>CONFIDENTIAL</span>
  </div>

</div>
</body>
</html>`;
};

// 4. REPORT EXPORTERS
export const handleReportExport = (type: 'PDF' | 'CSV' | 'JSON', data: any) => {
  if (type === 'PDF') {
    // Open styled HTML in a new window → user clicks "Save as PDF" or browser print dialog
    const html = buildPdfHtml(data);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      // Auto-trigger print after content loads
      win.onload = () => {
        setTimeout(() => win.print(), 400);
      };
    }
    return;
  }

  if (type === 'CSV') {
    const rows = [Object.keys(data), Object.values(data)];
    const csvContent = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veilon_report_${data.reportId || Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // JSON fallback
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veilon_report_${data.reportId || Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

