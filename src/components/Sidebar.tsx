import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import {
  LayoutDashboard, Map, Settings, Activity, CalendarRange,
  AlertTriangle, BarChart3, ChevronLeft, ChevronRight,
  ShieldAlert, Cpu, Brain, HelpCircle, Radio,
  PanelLeftClose, PanelLeftOpen, Dot, Circle
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard',         path: '/',                    icon: LayoutDashboard, accent: '#2563eb' },
      { name: 'Digital Twin',      path: '/digital-twin',        icon: Map,             accent: '#7c3aed' },
      { name: 'Device Operations', path: '/device-operations',   icon: Activity,        accent: '#0891b2' },
      { name: 'Planner',           path: '/planner',             icon: CalendarRange,   accent: '#059669' },
    ]
  },
  {
    label: 'AI Intelligence',
    items: [
      { name: 'AI Agent Center',   path: '/agent-intelligence',  icon: Cpu,             accent: '#d97706' },
      { name: 'AI Swarm Center',   path: '/swarm-center',        icon: Radio,           accent: '#db2777' },
      { name: 'Explainable AI',    path: '/explainable-ai',      icon: HelpCircle,      accent: '#7c3aed' },
      { name: 'AI Control Center', path: '/governance',          icon: Brain,           accent: '#4f46e5' },
    ]
  },
  {
    label: 'Management',
    items: [
      { name: 'Alerts',            path: '/alerts',              icon: AlertTriangle,   accent: '#dc2626' },
      { name: 'Analytics',         path: '/analytics',           icon: BarChart3,       accent: '#0284c7' },
      { name: 'Settings',          path: '/settings',            icon: Settings,        accent: '#475569' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { alerts, systemStats } = useSimulation();
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const getBadge = (path: string) => {
    if (path === '/alerts') return alerts.filter(a => a.status === 'active').length;
    if (path === '/device-operations') return systemStats.critical + systemStats.warning;
    return 0;
  };

  return (
    <aside style={{
      width: collapsed ? 68 : 248,
      minWidth: collapsed ? 68 : 248,
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      overflow: 'hidden',
      flexShrink: 0,
      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '2px 0 16px rgba(15,23,42,0.06)',
    }}>

      {/* ── Brand Header ── */}
      <div style={{
        height: 60,
        display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 16px' : '0 18px',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 0
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden', flex: collapsed ? 'unset' : 1, minWidth: 0 }}>
          {/* Logo mark */}
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(79,70,229,0.35)',
          }}>
            <ShieldAlert size={16} color="#ffffff" />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', lineHeight: 1 }}>
              <div style={{
                fontSize: 15, fontWeight: 800, color: '#0f172a',
                letterSpacing: '-0.3px', whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif"
              }}>
                Veilon
              </div>
              <div style={{
                fontSize: 9, color: '#94a3b8', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', marginTop: 1
              }}>
                AI Operations Platform
              </div>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.15s ease',
              color: '#94a3b8'
            }}
          >
            <PanelLeftClose size={13} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* ── System Status Strip ── */}
      {!collapsed && (
        <div style={{
          margin: '10px 14px 4px',
          background: criticalCount > 0 ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${criticalCount > 0 ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: 10,
          padding: '7px 11px',
          display: 'flex', alignItems: 'center', gap: 7,
          flexShrink: 0
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: criticalCount > 0 ? '#ef4444' : '#10b981',
            boxShadow: criticalCount > 0 ? '0 0 6px rgba(239,68,68,0.5)' : '0 0 6px rgba(16,185,129,0.5)',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: criticalCount > 0 ? '#dc2626' : '#16a34a',
          }}>
            {criticalCount > 0 ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}` : 'All Systems Nominal'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: 'monospace', color: '#94a3b8', fontWeight: 600 }}>
            {systemStats.healthy}/{systemStats.total} ✓
          </span>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: collapsed ? '12px 8px' : '8px 10px',
      }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: collapsed ? 8 : 20 }}>
            {/* Group Label */}
            {!collapsed ? (
              <div style={{
                fontSize: 9, fontWeight: 700, color: '#cbd5e1',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 8px', marginBottom: 4, marginTop: gi > 0 ? 4 : 0
              }}>
                {group.label}
              </div>
            ) : (
              gi > 0 && <div style={{ height: 1, background: '#f1f5f9', margin: '8px 4px 10px' }} />
            )}

            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const badge = getBadge(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: 1 }}
                >
                  <motion.div
                    whileHover={{ backgroundColor: isActive ? undefined : '#f8fafc' }}
                    whileTap={{ scale: 0.985 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '9px 0' : '8px 10px',
                      borderRadius: 9,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative',
                      cursor: 'pointer',
                      background: isActive ? `${item.accent}10` : 'transparent',
                      transition: 'background 0.12s ease',
                    }}
                    title={collapsed ? item.name : undefined}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-bar"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '18%',
                          bottom: '18%',
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          background: item.accent,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}

                    {/* Icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? `${item.accent}15` : 'transparent',
                      border: isActive ? `1px solid ${item.accent}22` : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}>
                      <Icon
                        size={15}
                        color={isActive ? item.accent : '#94a3b8'}
                        style={{ transition: 'color 0.15s ease' }}
                      />
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span style={{
                        fontSize: 12.5,
                        fontWeight: isActive ? 600 : 450,
                        color: isActive ? '#0f172a' : '#64748b',
                        flex: 1, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        letterSpacing: '-0.1px',
                        transition: 'color 0.15s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {item.name}
                      </span>
                    )}

                    {/* Badge */}
                    {!collapsed && badge > 0 && (
                      <div style={{
                        minWidth: 18, height: 18, borderRadius: 100,
                        background: item.path === '/alerts' ? '#ef4444' : '#f59e0b',
                        color: '#fff', fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 5px', flexShrink: 0
                      }}>
                        {badge}
                      </div>
                    )}

                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <div style={{
                        position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#0f172a', color: '#f1f5f9',
                        fontSize: 11, fontWeight: 600, padding: '6px 10px',
                        borderRadius: 8, whiteSpace: 'nowrap',
                        border: '1px solid #1e293b',
                        pointerEvents: 'none', zIndex: 200,
                        opacity: 0, transition: 'opacity 0.1s',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }} className="nav-tooltip">
                        {item.name}
                        {badge > 0 && (
                          <span style={{ marginLeft: 6, background: '#ef4444', borderRadius: 100, padding: '1px 5px', fontSize: 9 }}>{badge}</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Version Tag ── */}
      {!collapsed && (
        <div style={{
          padding: '6px 18px 2px',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '5px 10px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.5)' }} />
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b', fontWeight: 600, flex: 1 }}>v2.4.0-LTS</span>
            <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>● Live</span>
          </div>
        </div>
      )}

      {/* ── User Profile Footer ── */}
      <div style={{
        borderTop: '1px solid #f1f5f9',
        padding: collapsed ? '12px 8px' : '12px 14px',
        flexShrink: 0,
      }}>
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'default',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
            }} title="Lead Operator">
              OP
            </div>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                width: 32, height: 28, borderRadius: 7,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Expand sidebar"
            >
              <PanelLeftOpen size={13} color="#94a3b8" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              position: 'relative'
            }}>
              OP
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 9, height: 9, borderRadius: '50%',
                background: '#10b981', border: '2px solid #fff',
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-0.1px'
              }}>
                Lead Operator
              </div>
              <div style={{
                fontSize: 9.5, color: '#94a3b8', fontFamily: 'monospace',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                detroit@veilon.io
              </div>
            </div>

            {/* Collapse btn */}
            <button
              onClick={() => setCollapsed(true)}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease'
              }}
              title="Collapse sidebar"
            >
              <PanelLeftClose size={13} color="#94a3b8" />
            </button>
          </div>
        )}
      </div>

      {/* Tooltip CSS */}
      <style>{`
        .nav-tooltip { opacity: 0; }
        a:hover .nav-tooltip { opacity: 1 !important; }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }
      `}</style>
    </aside>
  );
};
