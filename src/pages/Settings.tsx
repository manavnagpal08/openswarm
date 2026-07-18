import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Globe, User, Shield, Info } from 'lucide-react';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    telemetryCritical: true,
    telemetryWarning: false,
    maintenanceReminder: true
  });

  const [language, setLanguage] = useState('en');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Control Center Settings</h1>
        <p className="text-slate-500 text-xs mt-1">Configure layout notifications, communication preferences, profile indexes and system metadata</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="glass-card p-4 space-y-1 h-fit">
          <button className="w-full text-left px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-3">
            <User size={16} /> Profile Configuration
          </button>
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-xs flex items-center gap-3">
            <Bell size={16} /> Notification Rules
          </button>
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-xs flex items-center gap-3">
            <Globe size={16} /> Language & Region
          </button>
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-xs flex items-center gap-3">
            <Shield size={16} /> Access Control keys
          </button>
        </div>

        {/* Configurations Form panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5"><User size={16} className="text-blue-600" /> Operator Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-400">Operator Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-400">Facility ID</label>
                <input
                  type="text"
                  defaultValue="FAC-DETROIT-02"
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] uppercase font-bold text-slate-400">Direct Email Address</label>
                <input
                  type="email"
                  defaultValue="john.doe@sentinelstream.io"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Notifications config */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5"><Bell size={16} className="text-blue-600" /> Alerts & Warnings Dispatch</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">Critical Telemetry Exceptions</h4>
                  <p className="text-[9px] text-slate-405">Notify operator when physical values cross critical thresholds</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.telemetryCritical}
                  onChange={(e) => setNotifications(n => ({ ...n, telemetryCritical: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 border-slate-250 bg-white"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">System Warning Warnings</h4>
                  <p className="text-[9px] text-slate-405">Notify when devices report warning state drift</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.telemetryWarning}
                  onChange={(e) => setNotifications(n => ({ ...n, telemetryWarning: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 border-slate-250 bg-white"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">Daily Maintenance Recap</h4>
                  <p className="text-[9px] text-slate-405">Receive morning updates about pending planner tasks</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.maintenanceReminder}
                  onChange={(e) => setNotifications(n => ({ ...n, maintenanceReminder: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 border-slate-250 bg-white"
                />
              </label>
            </div>
          </div>

          {/* System metadata */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5"><Info size={16} className="text-blue-600" /> Platform Architecture</h3>
            <div className="space-y-2 text-[10px] text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>SENTINEL CORE ENGINE:</span>
                <span className="text-slate-700">v1.10.4-LTS</span>
              </div>
              <div className="flex justify-between">
                <span>INTERFACE STACK:</span>
                <span className="text-slate-700">React 19 + Vite 8 + TS</span>
              </div>
              <div className="flex justify-between">
                <span>SIMULATION FPS:</span>
                <span className="text-green-600 font-bold">1.0 Hz (NOMINAL)</span>
              </div>
              <div className="flex justify-between">
                <span>LOCAL TIMEZONE:</span>
                <span className="text-slate-700">UTC+05:30 (India Standard Time)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="py-2 px-5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold rounded-xl uppercase transition-all shadow-sm">
              Discard
            </button>
            <button className="py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase transition-all shadow-md shadow-blue-600/10" onClick={() => alert('Operational preference profile saved.')}>
              Save Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
