import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  Activity, 
  CalendarRange, 
  AlertTriangle, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Cpu,
  Brain,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Digital Twin Map', path: '/digital-twin', icon: Map },
    { name: 'Device Operations', path: '/device-operations', icon: Activity },
    { name: 'Planner', path: '/planner', icon: CalendarRange },
    { name: 'AI Agent Center', path: '/agent-intelligence', icon: Cpu },
    { name: 'AI Swarm Center', path: '/swarm-center', icon: Activity },
    { name: 'Explainable AI', path: '/explainable-ai', icon: HelpCircle },
    { name: 'AI Control Center', path: '/governance', icon: Brain },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-md shadow-blue-500/10 shrink-0">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-sm tracking-wider text-slate-800 uppercase whitespace-nowrap">
              Veilon
            </span>
          )}
        </Link>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors hidden md:block"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-blue-50 border-l-2 border-blue-600 text-blue-600 font-semibold' 
                  : 'text-slate-550 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon 
                size={18} 
                className={`shrink-0 transition-transform group-hover:scale-102 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} 
              />
              {!collapsed && <span className="text-xs tracking-wide">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        {collapsed ? (
          <button 
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center py-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 w-full justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 border border-blue-200 shadow-sm">
                OP
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-800">Lead Operator</span>
                <span className="text-[10px] text-slate-500 truncate">detroit@sentinel.io</span>
              </div>
            </div>
            <button 
              onClick={() => setCollapsed(true)}
              className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-700 hidden md:block"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
