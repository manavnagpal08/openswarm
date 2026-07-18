import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Sparkles, AlertTriangle, CalendarRange, User, LogOut, Settings as SettingsIcon } from 'lucide-react';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, tickets, machines, systemStats } = useSimulation();
  const [time, setTime] = useState(new Date());
  
  // Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Calculate status label
  let statusText = 'SYSTEM OPTIMAL';
  let statusColor = 'text-green-700 bg-green-50 border-green-200';
  let dotColor = 'bg-green-500';
  if (systemStats.critical > 0) {
    statusText = 'CRITICAL ATTENTION';
    statusColor = 'text-red-700 bg-red-50 border-red-200 glow-danger';
    dotColor = 'bg-red-500';
  } else if (systemStats.warning > 0) {
    statusText = 'SYSTEM ATTENTION';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200 glow-warning';
    dotColor = 'bg-amber-500';
  }

  // Global Search logic
  const searchResults = searchText.trim() === '' ? [] : [
    ...machines.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()) || m.id.toLowerCase().includes(searchText.toLowerCase()))
      .map(m => ({ type: 'Device', title: m.name, sub: m.id, link: '/device-operations' })),
    ...tickets.filter(t => t.machineName.toLowerCase().includes(searchText.toLowerCase()) || t.id.toLowerCase().includes(searchText.toLowerCase()))
      .map(t => ({ type: 'Ticket', title: t.issue, sub: `${t.id} - ${t.machineName}`, link: '/planner' })),
    ...alerts.filter(a => a.deviceName.toLowerCase().includes(searchText.toLowerCase()) || a.issue.toLowerCase().includes(searchText.toLowerCase()))
      .map(a => ({ type: 'Alert', title: a.issue, sub: a.deviceName, link: '/alerts' }))
  ].slice(0, 5);

  // Expanded Notifications list
  const criticalNotifications = alerts.filter(a => a.status === 'active' && a.severity === 'critical')
    .map(a => ({ type: 'Critical', text: `Anomaly: ${a.issue} on ${a.deviceName}`, icon: AlertTriangle, color: 'text-red-500' }));
  const plannerNotifications = tickets.filter(t => t.status === 'overdue' || t.status === 'scheduled')
    .map(t => ({ type: 'Maintenance', text: `Schedule Due: ${t.issue}`, icon: CalendarRange, color: 'text-blue-500' }));
  const aiRecommendations = [
    { type: 'AI Recommend', text: 'Servicing fan motor on DEV-010 can boost efficiency by 12%.', icon: Sparkles, color: 'text-purple-500' }
  ];
  const allNotifications = [...criticalNotifications, ...plannerNotifications, ...aiRecommendations];

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="hidden md:flex items-center gap-2.5 w-96 relative">
        <Search className="absolute left-3 text-slate-400" size={16} />
        <input
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          placeholder="Search devices, engineers, tickets, alerts..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all"
        />

        {/* Search Results Dropdown Overlay */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2">
            <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-slate-400 border-b border-slate-100">
              Matched Console Logs ({searchResults.length})
            </div>
            <div className="space-y-0.5 mt-1.5">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigate(res.link);
                    setShowSearchDropdown(false);
                    setSearchText('');
                  }}
                  className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-left transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-850 truncate max-w-[240px]">{res.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{res.sub}</p>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSearchDropdown && searchText.trim() !== '' && searchResults.length === 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-6 text-center text-xs text-slate-400 italic">
            No console matches for "{searchText}"
          </div>
        )}
      </div>

      {/* Clock and Meta Operations */}
      <div className="flex items-center gap-5 ml-auto">
        {/* Live Date-Time */}
        <div className="flex items-center gap-3 text-xs tracking-wider text-slate-500 font-mono border-r border-slate-200 pr-5">
          <span>{formattedDate}</span>
          <span className="text-blue-600 font-bold">{formattedTime}</span>
        </div>

        {/* System Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} inline-block animate-ping`}></span>
          <span>{statusText}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setShowSearchDropdown(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all relative border border-slate-200"
          >
            <Bell size={18} />
            {allNotifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {allNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl z-50 max-h-[380px] overflow-y-auto">
              <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800">Command Notifications</span>
                <span className="text-[10px] text-blue-600 font-bold">{allNotifications.length} items</span>
              </div>
              {allNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  All telemetry values nominal.
                </div>
              ) : (
                <div className="space-y-1">
                  {allNotifications.map((notif, idx) => {
                    const Icon = notif.icon;
                    return (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded-xl text-left hover:bg-slate-50 border border-transparent transition-colors flex items-start gap-2.5"
                      >
                        <Icon size={14} className={`shrink-0 mt-0.5 ${notif.color}`} />
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{notif.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{notif.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Light Theme Indicator */}
        <div className="p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-1.5 text-xs font-semibold">
          <Sun size={15} />
          <span className="hidden sm:inline text-[9px] tracking-wider font-bold">LIGHT CONTROL</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowSearchDropdown(false);
            }}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm border border-blue-700/10">
              OP
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl z-50 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                <p className="text-xs font-bold text-slate-800">John Doe</p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">Facility Lead Operator</p>
              </div>
              <button 
                onClick={() => {
                  navigate('/settings');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-700 flex items-center gap-2.5 transition-colors"
              >
                <SettingsIcon size={14} className="text-slate-400" /> Account Settings
              </button>
              <button 
                onClick={() => {
                  alert('Logging out of command console...');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-bold text-red-500 flex items-center gap-2.5 transition-colors border-t border-slate-100 pt-2.5 mt-1"
              >
                <LogOut size={14} /> Log Out Console
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
