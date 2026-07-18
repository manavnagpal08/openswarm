import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, resolveAlert } = useSimulation();

  // Find the first active critical alert
  const activeCriticalAlert = alerts.find(a => a.severity === 'critical' && a.status === 'active');

  if (!activeCriticalAlert) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50 max-w-sm w-full font-sans">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="bg-red-600 border border-red-500 rounded-2xl p-4 shadow-2xl text-white space-y-3"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-red-750 px-2 py-0.5 rounded">
              <AlertTriangle size={12} className="animate-bounce" /> Emergency Alert
            </span>
            <button 
              onClick={() => resolveAlert(activeCriticalAlert.id)}
              className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-xs">
            <p className="font-bold">{activeCriticalAlert.deviceName}</p>
            <p className="text-[10px] opacity-90 mt-0.5">{activeCriticalAlert.issue}</p>
            <p className="text-[9px] opacity-75 mt-1 font-mono">Device ID: {activeCriticalAlert.deviceId} | Severity: Critical</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => resolveAlert(activeCriticalAlert.id)}
              className="flex-1 py-1 bg-white hover:bg-slate-100 text-red-700 font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow"
            >
              <Check size={10} /> Acknowledge
            </button>
            <button
              onClick={() => {
                navigate('/device-operations');
              }}
              className="flex-1 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all border border-red-500 flex items-center justify-center gap-1"
            >
              <Eye size={10} /> View Device
            </button>
            <button
              onClick={() => resolveAlert(activeCriticalAlert.id)}
              className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-[9px] rounded-lg uppercase transition-all"
              title="Dismiss Alert"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default FloatingAlerts;
