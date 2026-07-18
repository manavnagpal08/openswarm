import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  HelpCircle,
  Zap,
  Radio
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, color: '#3b82f6' },
      { name: 'Digital Twin', path: '/digital-twin', icon: Map, color: '#8b5cf6' },
      { name: 'Device Operations', path: '/device-operations', icon: Activity, color: '#06b6d4' },
      { name: 'Planner', path: '/planner', icon: CalendarRange, color: '#10b981' },
    ]
  },
  {
    label: 'AI Intelligence',
    items: [
      { name: 'AI Agent Center', path: '/agent-intelligence', icon: Cpu, color: '#f59e0b' },
      { name: 'AI Swarm Center', path: '/swarm-center', icon: Radio, color: '#ec4899' },
      { name: 'Explainable AI', path: '/explainable-ai', icon: HelpCircle, color: '#a78bfa' },
      { name: 'AI Control Center', path: '/governance', icon: Brain, color: '#6366f1' },
    ]
  },
  {
    label: 'Management',
    items: [
      { name: 'Alerts', path: '/alerts', icon: AlertTriangle, color: '#ef4444' },
      { name: 'Analytics', path: '/analytics', icon: BarChart3, color: '#0ea5e9' },
      { name: 'Settings', path: '/settings', icon: Settings, color: '#64748b' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        minWidth: collapsed ? 72 : 240,
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 40,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── Logo Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 64, borderBottom: '1px solid #1e293b',
        flexShrink: 0
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
          }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Veilon</div>
              <div style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', letterSpacing: 1, whiteSpace: 'nowrap' }}>AI OPS PLATFORM</div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid #1e293b',
            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569', flexShrink: 0
          }}>
            <ChevronLeft size={14} color="#475569" />
          </button>
        )}
      </div>

      {/* ── Navigation Groups ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 10px' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <div style={{
                fontSize: 8, fontWeight: 800, color: '#334155',
                textTransform: 'uppercase', letterSpacing: 1.5,
                padding: '0 8px', marginBottom: 6
              }}>
                {group.label}
              </div>
            )}
            {collapsed && <div style={{ height: 1, background: '#1e293b', margin: '6px 4px 10px' }} />}

            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
                >
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: collapsed ? '10px' : '9px 10px',
                      borderRadius: 10,
                      background: isActive ? `${item.color}18` : 'transparent',
                      border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative'
                    }}
                    title={collapsed ? item.name : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: '60%', borderRadius: 2,
                        background: item.color
                      }} />
                    )}

                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isActive ? `${item.color}22` : '#1e293b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}>
                      <Icon size={14} color={isActive ? item.color : '#64748b'} />
                    </div>

                    {!collapsed && (
                      <span style={{
                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#f1f5f9' : '#64748b',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color 0.2s'
                      }}>
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div style={{
                        position: 'absolute', left: 'calc(100% + 12px)', top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#1e293b', color: '#f1f5f9', fontSize: 11, fontWeight: 600,
                        padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap',
                        border: '1px solid #334155', pointerEvents: 'none',
                        opacity: 0, zIndex: 100,
                        transition: 'opacity 0.15s'
                      }} className="sidebar-tooltip">
                        {item.name}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer / User ── */}
      <div style={{
        borderTop: '1px solid #1e293b', padding: collapsed ? '12px 10px' : '12px 16px',
        flexShrink: 0
      }}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} style={{
            width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '8px', borderRadius: 10, border: '1px solid #1e293b',
            background: 'transparent', cursor: 'pointer', color: '#475569'
          }}>
            <ChevronRight size={16} color="#475569" />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff'
            }}>OP</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap' }}>Lead Operator</div>
              <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>detroit@veilon.io</div>
            </div>
            <button onClick={() => setCollapsed(true)} style={{
              width: 24, height: 24, borderRadius: 6, border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ChevronLeft size={14} color="#475569" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
