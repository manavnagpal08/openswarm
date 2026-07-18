import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Search, Filter } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { alerts, resolveAlert } = useSimulation();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.deviceName.toLowerCase().includes(search.toLowerCase()) || 
                          a.issue.toLowerCase().includes(search.toLowerCase()) ||
                          a.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Operational Alerts History</h1>
          <p className="text-slate-550 text-xs mt-1">Audit log of system anomalies, physical limit violations and device warning thresholds</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search alerts by machine, ID, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5"><Filter size={12} /> Severity</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-[10px] text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="warning">Warning Only</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5"><Filter size={12} /> Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-[10px] text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="active">Active Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table list */}
      <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                <th className="p-4">Alert ID</th>
                <th className="p-4">Machine Details</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No matching alerts found in active logs index.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-500">{alert.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{alert.deviceName}</div>
                      <div className="text-[9px] text-slate-450 font-mono mt-0.5">{alert.deviceId}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium max-w-xs truncate" title={alert.issue}>
                      {alert.issue}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        alert.severity === 'critical' 
                          ? 'bg-red-50 text-red-650 border border-red-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-450 text-[10px]">{alert.timestamp}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase ${
                        alert.status === 'active' ? 'text-red-500 animate-pulse' : 'text-green-600'
                      }`}>
                        {alert.status === 'active' ? 'Active' : 'Resolved'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {alert.status === 'active' ? (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:bg-green-50 hover:text-green-650 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-colors shadow-sm"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">RESOLVED</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
