import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import {
  LayoutDashboard, Map, Settings, Activity, CalendarRange,
  AlertTriangle, BarChart3, ShieldAlert, Cpu, Brain,
  HelpCircle, Radio, PanelLeftClose, PanelLeftOpen,
  Zap, TrendingUp
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard',         path: '/',                   icon: LayoutDashboard, accent: '#2563eb', glow: 'rgba(37,99,235,0.35)' },
      { name: 'Digital Twin',      path: '/digital-twin',       icon: Map,             accent: '#7c3aed', glow: 'rgba(124,58,237,0.35)' },
      { name: 'Device Operations', path: '/device-operations',  icon: Activity,        accent: '#0891b2', glow: 'rgba(8,145,178,0.35)' },
      { name: 'Planner',           path: '/planner',            icon: CalendarRange,   accent: '#059669', glow: 'rgba(5,150,105,0.35)' },
    ]
  },
  {
    label: 'AI Intelligence',
    items: [
      { name: 'AI Agent Center',   path: '/agent-intelligence', icon: Cpu,             accent: '#d97706', glow: 'rgba(217,119,6,0.35)' },
      { name: 'AI Swarm Center',   path: '/swarm-center',       icon: Radio,           accent: '#db2777', glow: 'rgba(219,39,119,0.35)' },
      { name: 'Explainable AI',    path: '/explainable-ai',     icon: HelpCircle,      accent: '#7c3aed', glow: 'rgba(124,58,237,0.35)' },
      { name: 'AI Control Center', path: '/governance',         icon: Brain,           accent: '#4f46e5', glow: 'rgba(79,70,229,0.35)' },
    ]
  },
  {
    label: 'Management',
    items: [
      { name: 'Alerts',            path: '/alerts',             icon: AlertTriangle,   accent: '#dc2626', glow: 'rgba(220,38,38,0.35)' },
      { name: 'Analytics',         path: '/analytics',          icon: BarChart3,       accent: '#0284c7', glow: 'rgba(2,132,199,0.35)' },
      { name: 'Settings',          path: '/settings',           icon: Settings,        accent: '#475569', glow: 'rgba(71,85,105,0.25)' },
    ]
  }
];

// ── Animated Nav Item ────────────────────────────────────────────────────────
const NavItem: React.FC<{
  item: typeof NAV_GROUPS[0]['items'][0];
  isActive: boolean;
  collapsed: boolean;
  badge?: number;
  index: number;
}> = ({ item, isActive, collapsed, badge = 0, index }) => {
  const Icon = item.icon;
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 2 }}
    >
      <Link
        to={item.path}
        onClick={handleClick}
        style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
      >
        {/* Active glow backdrop */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                background: `radial-gradient(ellipse at left center, ${item.glow} 0%, transparent 70%)`,
                pointerEvents: 'none', zIndex: 0
              }}
            />
          )}
        </AnimatePresence>

        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          animate={{
            backgroundColor: isActive ? `${item.accent}12` : hovered ? '#f8fafc' : 'transparent',
          }}
          transition={{ duration: 0.15 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            position: 'relative', cursor: 'pointer',
            border: isActive ? `1px solid ${item.accent}20` : '1px solid transparent',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {/* Ripple Effect */}
          <AnimatePresence>
            {ripple && (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: ripple.x - 10, top: ripple.y - 10,
                  width: 20, height: 20, borderRadius: '50%',
                  background: item.accent,
                  pointerEvents: 'none', zIndex: 0,
                }}
              />
            )}
          </AnimatePresence>

          {/* Active left bar */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                key="bar"
                layoutId="active-bar"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute', left: 0,
                  top: '15%', bottom: '15%', width: 3,
                  borderRadius: '0 3px 3px 0',
                  background: `linear-gradient(180deg, ${item.accent}, ${item.accent}aa)`,
                  boxShadow: `0 0 8px ${item.accent}`,
                }}
              />
            )}
          </AnimatePresence>

          {/* Icon container */}
          <motion.div
            animate={{
              background: isActive ? `${item.accent}18` : hovered ? `${item.accent}10` : 'transparent',
              boxShadow: isActive ? `0 0 12px ${item.glow}` : 'none',
              scale: hovered && !isActive ? 1.12 : 1,
            }}
            transition={{ duration: 0.2 }}
            style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isActive ? `1px solid ${item.accent}25` : '1px solid transparent',
              zIndex: 1,
            }}
          >
            <motion.div
              animate={{ rotate: isActive ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Icon size={15} color={isActive ? item.accent : hovered ? item.accent + 'cc' : '#94a3b8'} />
            </motion.div>
          </motion.div>

          {/* Label */}
          {!collapsed && (
            <motion.span
              animate={{ color: isActive ? '#0f172a' : hovered ? '#374151' : '#64748b' }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: 12.5, fontWeight: isActive ? 600 : 450,
                flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-0.1px', fontFamily: "'Inter', sans-serif",
                zIndex: 1,
              }}
            >
              {item.name}
            </motion.span>
          )}

          {/* Badge */}
          {!collapsed && badge > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              style={{
                minWidth: 18, height: 18, borderRadius: 100,
                background: item.path === '/alerts' ? '#ef4444' : '#f59e0b',
                color: '#fff', fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 5px', flexShrink: 0, zIndex: 1,
                boxShadow: item.path === '/alerts' ? '0 0 8px rgba(239,68,68,0.5)' : '0 0 8px rgba(245,158,11,0.5)',
              }}
            >
              {badge}
            </motion.div>
          )}

          {/* Collapsed Tooltip */}
          {collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -4, scale: 0.9 }}
              whileHover={{ opacity: 1, x: 0, scale: 1 }}
              style={{
                position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                transform: 'translateY(-50%)',
                background: '#0f172a', color: '#f1f5f9',
                fontSize: 11, fontWeight: 600, padding: '6px 10px',
                borderRadius: 8, whiteSpace: 'nowrap',
                border: '1px solid #1e293b', pointerEvents: 'none',
                zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}
            >
              {item.name}
              {badge > 0 && (
                <span style={{ marginLeft: 6, background: '#ef4444', borderRadius: 100, padding: '1px 5px', fontSize: 9 }}>{badge}</span>
              )}
            </motion.div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
};

// ── Animated Logo ────────────────────────────────────────────────────────────
const AnimatedLogo: React.FC = () => {
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 800);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.05 }}
      transition={{ duration: 0.5 }}
      style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: shimmer
          ? 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #2563eb 100%)'
          : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: shimmer
          ? '0 0 20px rgba(99,102,241,0.7), 0 2px 10px rgba(79,70,229,0.4)'
          : '0 2px 10px rgba(79,70,229,0.35)',
        transition: 'background 0.6s ease, box-shadow 0.6s ease',
        cursor: 'pointer',
      }}
    >
      <motion.div
        animate={{ rotate: shimmer ? 360 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <ShieldAlert size={17} color="#ffffff" />
      </motion.div>
    </motion.div>
  );
};

// ── Breathing Status Strip ────────────────────────────────────────────────────
const StatusStrip: React.FC<{ criticalCount: number; healthy: number; total: number }> = ({ criticalCount, healthy, total }) => {
  const isCritical = criticalCount > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      style={{
        margin: '10px 12px 4px',
        background: isCritical ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isCritical ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: 10, padding: '7px 11px',
        display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
        overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Animated shimmer sweep */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '40%',
          background: `linear-gradient(90deg, transparent, ${isCritical ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)'}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Pulse dot */}
      <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -2, borderRadius: '50%',
            background: isCritical ? '#ef4444' : '#10b981',
          }}
        />
        <div style={{
          width: 8, height: 8, borderRadius: '50%', position: 'absolute',
          top: 1, left: 1,
          background: isCritical ? '#ef4444' : '#10b981',
        }} />
      </div>

      <span style={{ fontSize: 10, fontWeight: 700, color: isCritical ? '#dc2626' : '#16a34a', flex: 1 }}>
        {isCritical ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}` : 'All Systems Nominal'}
      </span>
      <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#94a3b8', fontWeight: 600 }}>
        {healthy}/{total} ✓
      </span>
    </motion.div>
  );
};

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { alerts, systemStats } = useSimulation();
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const getBadge = (path: string) => {
    if (path === '/alerts') return alerts.filter(a => a.status === 'active').length;
    if (path === '/device-operations') return systemStats.critical + systemStats.warning;
    return 0;
  };

  let globalIndex = 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248, minWidth: collapsed ? 68 : 248 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        height: '100vh', background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, zIndex: 40,
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '2px 0 24px rgba(15,23,42,0.07)',
      }}
    >
      {/* ── Brand Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 62, display: 'flex', alignItems: 'center',
          padding: collapsed ? '0 17px' : '0 16px 0 14px',
          borderBottom: '1px solid #f1f5f9', flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between', gap: 0,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden', flex: collapsed ? 'unset' : 1 }}>
          <AnimatedLogo />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden', lineHeight: 1 }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  Veilon
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 1 }}>
                  AI Operations Platform
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#f8fafc', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <PanelLeftClose size={13} color="#94a3b8" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Live Status Strip ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <StatusStrip criticalCount={criticalCount} healthy={systemStats.healthy} total={systemStats.total} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation Groups ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '12px 7px' : '8px 10px' }}>
        {NAV_GROUPS.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: gi * 0.08, duration: 0.3 }}
            style={{ marginBottom: collapsed ? 8 : 20 }}
          >
            {/* Group label */}
            <AnimatePresence>
              {!collapsed ? (
                <motion.div
                  key="label"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: 9, fontWeight: 700, color: '#cbd5e1',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '0 8px', marginBottom: 4, marginTop: gi > 0 ? 4 : 0,
                  }}
                >
                  {group.label}
                </motion.div>
              ) : (
                gi > 0 && <motion.div key="sep" style={{ height: 1, background: '#f1f5f9', margin: '8px 4px 10px' }} />
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const idx = globalIndex++;
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  collapsed={collapsed}
                  badge={getBadge(item.path)}
                  index={idx}
                />
              );
            })}
          </motion.div>
        ))}
      </nav>

      {/* ── Version Tag ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ padding: '6px 14px 4px', flexShrink: 0 }}
          >
            <motion.div
              whileHover={{ scale: 1.02, borderColor: '#c7d2fe' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '5px 10px', cursor: 'default',
                transition: 'border-color 0.2s',
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}
              />
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b', fontWeight: 600, flex: 1 }}>v2.4.0-LTS</span>
              <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>Live</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Profile Footer ── */}
      <motion.div
        style={{ borderTop: '1px solid #f1f5f9', padding: collapsed ? '12px 8px' : '12px 14px', flexShrink: 0 }}
      >
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'default',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)', position: 'relative'
              }}
              title="Lead Operator"
            >
              OP
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%', background: '#10b981', border: '2px solid #fff'
              }} />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(false)}
              style={{
                width: 32, height: 28, borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#f8fafc', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
              }}
              title="Expand sidebar"
            >
              <PanelLeftOpen size={13} color="#94a3b8" />
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#fff',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                position: 'relative', cursor: 'default',
              }}
            >
              OP
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#10b981', border: '2px solid #fff',
                }}
              />
            </motion.div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
                Lead Operator
              </div>
              <div style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                detroit@veilon.io
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(true)}
              style={{
                width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#f8fafc', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
              title="Collapse sidebar"
            >
              <PanelLeftClose size={13} color="#94a3b8" />
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Scrollbar styles */}
      <style>{`
        aside nav::-webkit-scrollbar { width: 3px; }
        aside nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        aside nav::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </motion.aside>
  );
};
