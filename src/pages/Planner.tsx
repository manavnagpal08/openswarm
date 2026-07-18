import React, { useState } from 'react';
import { useSimulation, MaintenanceTicket } from '../context/SimulationContext';
import { handleReportExport } from '../services/AgentOrchestrator';
import { Calendar as CalendarIcon, CheckSquare, Clock, Users, Package, FileText, Check, Play, Pause, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Planner: React.FC = () => {
  const { tickets, setTickets, toggleChecklistItem, setMachines } = useSimulation();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Generate July 2026 Calendar days
  const daysInMonth = 31;
  const paddingDays = 3;
  const calendarCells = [];

  for (let i = 0; i < paddingDays; i++) {
    calendarCells.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `2026-07-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateStr });
  }

  // Get tickets mapping
  const getTicketsForDate = (dateStr: string | null) => {
    if (!dateStr) return [];
    return tickets.filter(t => t.assignedDate === dateStr);
  };

  const handleDayClick = (dateStr: string | null) => {
    if (!dateStr) return;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  // Get selected ticket details
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Trigger whole ticket completion state
  const handleCompleteTicket = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        
        // Mark all checklist items as completed
        const updatedChecklist = t.checklist.map(c => ({ ...c, completed: true }));
        
        // Recover machine state
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

        return {
          ...t,
          checklist: updatedChecklist,
          status: 'completed'
        };
      })
    );
    alert('All maintenance actions verified. Maintenance ticket marked Completed.');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Veilon Maintenance Planner</h1>
        <p className="text-slate-500 text-xs mt-1">Preventative and corrective schedules console. Synchronized with floor logs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 overflow-hidden h-[calc(100vh-170px)]">
        
        {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID */}
        <div className="xl:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-850 flex items-center gap-1.5"><CalendarIcon size={14} className="text-blue-600" /> Facility Workorders</h2>
              <span className="text-[10px] font-mono font-bold text-blue-600">JULY 2026</span>
            </div>

            {/* Calendar Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Days list */}
            <div className="grid grid-cols-7 gap-3">
              {calendarCells.map((cell, idx) => {
                const dayTickets = getTicketsForDate(cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;

                let dayBg = 'bg-slate-50/50 border-slate-100 text-slate-350';
                if (cell.day) {
                  dayBg = 'bg-white border-slate-200 hover:border-slate-300 text-slate-650 cursor-pointer';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(cell.dateStr)}
                    className={`min-h-24 border rounded-2xl p-2 flex flex-col justify-between transition-all select-none ${dayBg} ${
                      isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : ''
                    }`}
                  >
                    <span className="font-mono font-bold text-xs">{cell.day}</span>
                    
                    {/* Compact Maintenance Card inside calendar day */}
                    {dayTickets.map(ticket => {
                      let statusColor = 'bg-blue-500';
                      if (ticket.status === 'completed') statusColor = 'bg-green-500';
                      if (ticket.status === 'overdue') statusColor = 'bg-red-500';
                      if (ticket.status === 'upcoming') statusColor = 'bg-amber-500';

                      return (
                        <div 
                          key={ticket.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(ticket.id);
                          }}
                          className={`p-1.5 rounded-lg text-[8px] font-bold text-white uppercase truncate flex flex-col gap-0.5 mt-1 hover:scale-102 transition-transform ${statusColor}`}
                          title={`🔧 ${ticket.machineName}`}
                        >
                          <span className="truncate">🔧 {ticket.machineName}</span>
                          <span className="opacity-90 truncate">👨 {ticket.assignedEngineer}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKORDER DETAILED CONTROLS PANEL */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col shadow-sm overflow-hidden h-[calc(100vh-170px)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
            Workorder Details
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {selectedTicket ? (
              <div className="space-y-4">
                {/* Header info */}
                <div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-slate-400 font-bold">{selectedTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold text-white ${
                      selectedTicket.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>{selectedTicket.status}</span>
                  </div>
                  <h3 className="text-xs font-black text-slate-800 mt-1">{selectedTicket.machineName}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{selectedTicket.issue}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-550 border-t border-b border-slate-100 py-3">
                  <div><strong>Engineer:</strong> {selectedTicket.assignedEngineer}</div>
                  <div><strong>ETA Time:</strong> {selectedTicket.estimatedRepairTime}</div>
                  <div><strong>Severity:</strong> {selectedTicket.severity}</div>
                  <div><strong>Date:</strong> {selectedTicket.assignedDate}</div>
                </div>

                {/* Action Checklist */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-2">Checklist Tasks</h4>
                  <div className="space-y-2">
                    {selectedTicket.checklist.map((item, idx) => (
                      <label 
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border border-slate-200 cursor-pointer select-none transition-colors ${
                          item.completed ? 'opacity-50 line-through bg-slate-50 text-slate-400' : 'hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled={selectedTicket.status === 'completed'}
                          onChange={() => toggleChecklistItem(selectedTicket.id, idx)}
                          className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 border-slate-250 bg-white"
                        />
                        <span className="text-[10px] text-slate-650">{item.task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Workflow Execution Buttons */}
                {selectedTicket.status !== 'completed' && (
                  <button
                    onClick={() => handleCompleteTicket(selectedTicket.id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-600/10"
                  >
                    Complete Maintenance
                  </button>
                )}

                {/* Report Generation Option - ONLY Visible after completion */}
                {selectedTicket.status === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-green-700">
                      <FileText size={14} /> Report Generation Compiled
                    </div>
                    <button
                      onClick={() => handleReportExport('PDF', {
                        companyName: 'Veilon',
                        reportId: `REP-${selectedTicket.id}`,
                        incidentId: `INC-${selectedTicket.machineId}`,
                        deviceId: selectedTicket.machineId,
                        deviceName: selectedTicket.machineName,
                        deviceType: 'Industrial Core Module',
                        engineerName: selectedTicket.assignedEngineer,
                        maintenanceDate: selectedTicket.assignedDate,
                        completionTime: new Date().toLocaleTimeString(),
                        rootCauseAnalysis: selectedTicket.issue,
                        expectedDowntime: '2.5 Hours',
                        actualDowntime: '2.2 Hours',
                        componentsReplaced: selectedTicket.requiredParts.join(', '),
                        sensorReadingsBefore: 'Temp: 86.4°C, Vib: 3.4mm/s',
                        sensorReadingsAfter: 'Temp: 42.1°C, Vib: 1.1mm/s',
                        aiConfidence: 96
                      })}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-sm"
                    >
                      Generate Maintenance Report
                    </button>
                  </motion.div>
                )}

              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 italic">
                Select a compact workorder card on the calendar days to view engineering details.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Planner;
