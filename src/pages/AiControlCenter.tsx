import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { handleReportExport } from '../services/AgentOrchestrator';
import { 
  ShieldAlert, CheckCircle, XCircle, Search, Filter, ChevronRight, X, AlertTriangle, Eye, FileText, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AiControlCenter: React.FC = () => {
  const { machines, setMachines, tickets, setTickets, triggerAlert } = useSimulation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'health' | 'risk' | 'status'>('health');
  
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectedBy, setRejectedBy] = useState('');

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  // Sorting / Filtering logic
  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || m.governance.approvalStatus === approvalFilter;
    return matchesSearch && matchesStatus && matchesApproval;
  }).sort((a, b) => {
    if (sortBy === 'health') return a.healthScore - b.healthScore;
    if (sortBy === 'risk') {
      const riskMap = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      return riskMap[b.riskLevel] - riskMap[a.riskLevel];
    }
    return a.status.localeCompare(b.status);
  });

  // Calculate statistics
  const stats = {
    total: machines.length,
    healthy: machines.filter(m => m.status === 'healthy').length,
    critical: machines.filter(m => m.status === 'critical').length,
    pending: machines.filter(m => m.governance.approvalStatus === 'Pending').length,
    approved: machines.filter(m => m.governance.approvalStatus === 'Approved').length,
    rejected: machines.filter(m => m.governance.approvalStatus === 'Rejected').length,
    reports: machines.filter(m => m.governance.linkedReportPdf !== null).length + 4,
    todayMaintenance: tickets.filter(t => t.assignedDate === '2026-07-18').length
  };

  const handleApprove = (machineId: string) => {
    setMachines(prev => prev.map(m => {
      if (m.id === machineId) {
        return {
          ...m,
          governance: {
            ...m.governance,
            approvalStatus: 'Approved',
            linkedReportPdf: `REPORT-${m.id}-COMPLETED`
          }
        };
      }
      return m;
    }));

    // Add scheduled ticket to the Planner state for today
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setTickets(prev => [
        {
          id: `TKT-${Math.floor(400 + Math.random() * 500)}`,
          machineId: machine.id,
          machineName: machine.name,
          issue: machine.rootCause.mostLikelyCause || 'AI Scheduled Preventive Check',
          severity: machine.status === 'critical' ? 'critical' : 'warning',
          priority: 'urgent',
          requiredParts: ['Replacement Fan Core', 'Coaxial Sensor Seal'],
          estimatedRepairTime: '2.0 Hours',
          checklist: [
            { task: 'Isolate power terminal safety lock', completed: false },
            { task: 'Replace degraded sub-module components', completed: false },
            { task: 'Restore and benchmark sensor stream telemetry', completed: false }
          ],
          status: 'scheduled',
          assignedDate: '2026-07-18', // Set for Today
          assignedEngineer: machine.maintenance.assignedEngineer || 'Marcus Vance'
        },
        ...prev
      ]);
    }
    alert('AI recommended maintenance schedule approved. Ticket logged to Planner calendar.');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) return;

    setMachines(prev => prev.map(m => {
      if (m.id === selectedMachineId) {
        return {
          ...m,
          governance: {
            ...m.governance,
            approvalStatus: 'Rejected',
            rejectionReason: rejectionReason,
            rejectedBy: rejectedBy || 'Supervisor',
            rejectedTimestamp: new Date().toLocaleTimeString()
          }
        };
      }
      return m;
    }));

    setShowRejectModal(false);
    setRejectionReason('');
    setRejectedBy('');
    alert('AI maintenance recommendation rejected. Log stored in audit history.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <ShieldAlert className="text-blue-600" /> AI Control Center & Governance Hub
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Review, approve or reject AI-generated preventative maintenance recommendations with complete decision journey traceability.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', val: stats.total, color: 'text-slate-650' },
          { label: 'Pending Approvals', val: stats.pending, color: 'text-amber-600 bg-amber-50/50' },
          { label: 'Approved Requests', val: stats.approved, color: 'text-green-700 bg-green-50/50' },
          { label: 'Rejected Requests', val: stats.rejected, color: 'text-red-655 bg-red-50/50' }
        ].map((s, idx) => (
          <div key={idx} className="glass-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">{s.label}</span>
            <span className={`text-2xl font-black mt-2 ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Main Governance Workspace */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Monitored Devices List */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-850">Telemetry Verification & Approvals</h2>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search device ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 text-[10px] text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="critical">Critical Only</option>
                <option value="warning">Warning Only</option>
                <option value="healthy">Healthy Only</option>
              </select>

              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="bg-white border border-slate-200 text-[10px] text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Approvals</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved Only</option>
                <option value="Rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* Devices Grid table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                  <th className="p-3">Device ID</th>
                  <th className="p-3">Device Name</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Approval State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                {filteredMachines.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500">{m.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                    <td className="p-3">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        m.riskLevel === 'Critical' || m.riskLevel === 'High' ? 'bg-red-50 text-red-655 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {m.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{m.healthScore}%</td>
                    <td className="p-3 uppercase font-bold text-[10px]">{m.status}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                        m.governance.approvalStatus === 'Approved' ? 'bg-green-50 text-green-700' : m.governance.approvalStatus === 'Rejected' ? 'bg-red-50 text-red-655' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.governance.approvalStatus === 'Approved' && <CheckCircle size={10} />}
                        {m.governance.approvalStatus === 'Rejected' && <XCircle size={10} />}
                        {m.governance.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedMachineId(m.id)}
                        className="px-2.5 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm flex items-center gap-1 ml-auto"
                      >
                        <Eye size={10} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Side Slide Drawer for Detailed AI Decision Verification */}
      <AnimatePresence>
        {selectedMachine && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMachineId(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white border-l border-slate-200 z-50 overflow-y-auto p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">{selectedMachine.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">{selectedMachine.id} | {selectedMachine.address}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedMachineId(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                {/* General Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-6 text-xs text-slate-650 font-mono">
                  <div><strong>Location:</strong> {selectedMachine.address}</div>
                  <div><strong>Risk Index:</strong> {selectedMachine.riskLevel}</div>
                  <div><strong>Telemetry Health:</strong> {selectedMachine.healthScore}%</div>
                  <div><strong>Approval Status:</strong> {selectedMachine.governance.approvalStatus}</div>
                </div>

                {/* AI Explanation details card */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 mb-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5"><AlertTriangle size={14} className="text-blue-600" /> Why was this device marked as Critical?</h4>
                  <div className="text-[10px] text-slate-650 space-y-2 leading-relaxed">
                    <p><strong>Metrics considered:</strong> Temperature and Vibration thresholds exceeded standard limits.</p>
                    <p><strong>Baseline Check:</strong> Sensor values deviate 24.5% above mean.</p>
                    <p><strong>AI Diagnostic Confidence:</strong> {selectedMachine.rootCause.confidence}% confidence score.</p>
                    <p><strong>Incident Justification:</strong> {selectedMachine.rootCause.aiExplanation}</p>
                  </div>
                </div>

                {/* AI Decision Journey visual flow */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">AI Decision Journey Handoffs</h4>
                  
                  <div className="relative pl-6 space-y-4">
                    {[
                      { name: 'Monitoring Agent', analysis: 'Telemetry ingested from active WebSockets frame.', output: 'Temp: 86.4°C, Vibration: 3.4mm/s' },
                      { name: 'Baseline Learning Agent', analysis: 'Compared values against historical baseline logs.', output: 'Deviation: 24.5%' },
                      { name: 'Anomaly Detection Agent', analysis: 'Identified abnormal parameters and mapped layout tags.', output: 'Incident severity flagged as Critical' },
                      { name: 'Root Cause Agent', analysis: 'Correlated thermals and high vibration axis readings.', output: selectedMachine.rootCause.mostLikelyCause },
                      { name: 'Impact Prediction Agent', analysis: 'Queried conveyor Line B floor pipeline database.', output: 'Downtime risk Level: High, duration 22 Mins' },
                      { name: 'Planner Agent', analysis: 'Generated checklist ticket steps and scheduled maintenance.', output: 'Workorder scheduled' },
                      { name: 'Supervisor Agent', analysis: 'Compiled final executive summary report.', output: 'Recommendation logged.' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border border-blue-600 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                        {idx < 6 && <div className="absolute -left-4 top-5 w-[1px] h-10 bg-slate-200" />}
                        
                        <div className="text-[10px] text-slate-700 leading-normal">
                          <strong className="text-slate-800">{step.name}</strong>
                          <p className="text-slate-550">{step.analysis}</p>
                          <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded mt-0.5 inline-block">{step.output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit trail details */}
                {selectedMachine.governance.approvalStatus === 'Rejected' && (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/20 mb-6">
                    <h4 className="text-xs font-bold text-red-700 uppercase flex items-center gap-1.5"><XCircle size={14} /> Rejection audit details</h4>
                    <p className="text-[10px] text-slate-655 mt-1 font-mono"><strong>Reason:</strong> {selectedMachine.governance.rejectionReason}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Rejected by: {selectedMachine.governance.rejectedBy} | {selectedMachine.governance.rejectedTimestamp}</p>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 pt-4 flex gap-3">
                {selectedMachine.governance.approvalStatus === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-655 font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all border border-red-200 shadow-sm"
                    >
                      Reject Recommendation
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedMachine.id)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-600/10"
                    >
                      Approve & Schedule
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-slate-400 font-mono italic">
                    Workflow verification complete. Status is {selectedMachine.governance.approvalStatus}.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Modal dialog overlay */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2">Provide Rejection Reason</h3>
            
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-slate-400">Supervisor Name</label>
              <input
                type="text"
                required
                value={rejectedBy}
                onChange={(e) => setRejectedBy(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-slate-400">Reasoning Details</label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm"
              >
                Submit Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
