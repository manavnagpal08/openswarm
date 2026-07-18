import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Globe, User, Shield, Info,
  Save, RotateCcw, Check, ChevronRight, Cpu, Wifi, Database,
  Lock, Key, Eye, EyeOff, Zap, Monitor, Sun, Moon
} from 'lucide-react';

// ─── Toggle Switch Component ────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; color?: string }> = ({
  checked, onChange, color = '#3b82f6'
}) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 42, height: 23, borderRadius: 100, border: 'none', cursor: 'pointer',
      background: checked ? color : '#e2e8f0',
      position: 'relative', transition: 'background 0.25s ease', flexShrink: 0,
      boxShadow: checked ? `0 0 8px ${color}55` : 'none'
    }}
  >
    <motion.div
      animate={{ x: checked ? 21 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        position: 'absolute', top: 3, width: 17, height: 17,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }}
    />
  </button>
);

// ─── Section types ────────────────────────────────────────────────────────────
type Section = 'profile' | 'notifications' | 'language' | 'security' | 'system';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@veilon.io',
    role: 'Senior Operations Engineer',
    facility: 'FAC-DETROIT-02',
    timezone: 'UTC+05:30',
    avatar: 'JD'
  });

  // Notifications state
  const [notifs, setNotifs] = useState({
    criticalTelemetry: true,
    warningAlerts: false,
    maintenanceReminders: true,
    agentHandoffs: true,
    dailyReport: false,
    emailDigest: true,
    smsAlerts: false,
    pushNotifications: true,
  });

  // Language state
  const [lang, setLang] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [pressureUnit, setPressureUnit] = useState<'bar' | 'psi'>('bar');

  // Security state
  const [showApiKey, setShowApiKey] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // System state  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [refreshRate, setRefreshRate] = useState('1');
  const [dataRetention, setDataRetention] = useState('30');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const navItems: { id: Section; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'profile', label: 'Operator Profile', icon: User, color: '#3b82f6' },
    { id: 'notifications', label: 'Notification Rules', icon: Bell, color: '#f59e0b' },
    { id: 'language', label: 'Language & Units', icon: Globe, color: '#10b981' },
    { id: 'security', label: 'Access & Security', icon: Shield, color: '#8b5cf6' },
    { id: 'system', label: 'Platform System', icon: Cpu, color: '#ec4899' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px',
    border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: 12, color: '#1e293b',
    background: '#fff', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.5, color: '#94a3b8', display: 'block', marginBottom: 5
  };
  const cardStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 16, padding: '20px 20px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
  };
  const sectionTitle = (label: string, Icon: React.ElementType, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}25` }}>
        <Icon size={13} color={color} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
    </div>
  );

  const toggleRow = (label: string, sub: string, key: keyof typeof notifs, color = '#3b82f6') => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>{sub}</div>
      </div>
      <Toggle checked={notifs[key]} onChange={(v) => setNotifs(n => ({ ...n, [key]: v }))} color={color} />
    </div>
  );

  return (
    <div style={{ maxWidth: 960, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>
          Control Center Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: 11, marginTop: 4, margin: 0 }}>
          Configure operator profile, notifications, units, access controls, and platform preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Sidebar Nav ── */}
        <div style={{ ...cardStyle, padding: '12px', position: 'sticky', top: 20 }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', padding: '12px 8px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: 8 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)'
            }}>
              {profile.avatar}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{profile.name}</div>
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{profile.role}</div>
            <div style={{ fontSize: 8, color: '#3b82f6', fontFamily: 'monospace', marginTop: 3 }}>{profile.facility}</div>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: isActive ? `${item.color}12` : 'transparent',
                  color: isActive ? item.color : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 11
                }}
              >
                <Icon size={14} />
                {item.label}
                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>

        {/* ── Content Panel ── */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >

              {/* ─── PROFILE ─── */}
              {activeSection === 'profile' && (
                <div style={{ ...cardStyle }}>
                  {sectionTitle('Operator Profile', User, '#3b82f6')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Display Name</label>
                      <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Role / Title</label>
                      <input style={inputStyle} value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Email Address</label>
                      <input style={inputStyle} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Facility ID</label>
                      <input style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} value={profile.facility} disabled />
                    </div>
                    <div>
                      <label style={labelStyle}>Timezone</label>
                      <select style={{ ...inputStyle, appearance: 'none' }} value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                        <option value="UTC+05:30">UTC+05:30 — India Standard Time</option>
                        <option value="UTC+00:00">UTC+00:00 — London</option>
                        <option value="UTC-05:00">UTC-05:00 — Eastern US</option>
                        <option value="UTC+08:00">UTC+08:00 — Singapore</option>
                        <option value="UTC+09:00">UTC+09:00 — Japan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── NOTIFICATIONS ─── */}
              {activeSection === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={cardStyle}>
                    {sectionTitle('Telemetry Alerts', Bell, '#ef4444')}
                    {toggleRow('Critical Telemetry Exceptions', 'Notify when physical values cross critical thresholds', 'criticalTelemetry', '#ef4444')}
                    {toggleRow('Warning State Drift', 'Notify when devices report warning-level anomalies', 'warningAlerts', '#f59e0b')}
                    {toggleRow('Agent Handoff Events', 'Notify when AI agents transfer active tasks', 'agentHandoffs', '#8b5cf6')}
                  </div>
                  <div style={cardStyle}>
                    {sectionTitle('Delivery Preferences', Bell, '#f59e0b')}
                    {toggleRow('Email Digest (Daily Summary)', 'Receive daily summary report via email at 08:00', 'emailDigest', '#3b82f6')}
                    {toggleRow('SMS Critical Alerts', 'Send SMS for P0 / critical system failures only', 'smsAlerts', '#ec4899')}
                    {toggleRow('Push Notifications', 'Browser push alerts for real-time events', 'pushNotifications', '#10b981')}
                    {toggleRow('Maintenance Reminders', 'Morning briefings on pending planner work-orders', 'maintenanceReminders', '#0ea5e9')}
                  </div>
                </div>
              )}

              {/* ─── LANGUAGE & UNITS ─── */}
              {activeSection === 'language' && (
                <div style={cardStyle}>
                  {sectionTitle('Language & Measurement Units', Globe, '#10b981')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Interface Language</label>
                      <select style={{ ...inputStyle, appearance: 'none' }} value={lang} onChange={e => setLang(e.target.value)}>
                        <option value="en">English (US)</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文 (Simplified)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Date Format</label>
                      <select style={{ ...inputStyle, appearance: 'none' }} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Temperature Unit</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['C', 'F'] as const).map(u => (
                          <button key={u} onClick={() => setTempUnit(u)} style={{
                            flex: 1, padding: '8px', borderRadius: 10, border: '1px solid',
                            borderColor: tempUnit === u ? '#10b981' : '#e2e8f0',
                            background: tempUnit === u ? '#f0fdf4' : '#fff',
                            color: tempUnit === u ? '#10b981' : '#64748b',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                          }}>°{u}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Pressure Unit</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['bar', 'psi'] as const).map(u => (
                          <button key={u} onClick={() => setPressureUnit(u)} style={{
                            flex: 1, padding: '8px', borderRadius: 10, border: '1px solid',
                            borderColor: pressureUnit === u ? '#10b981' : '#e2e8f0',
                            background: pressureUnit === u ? '#f0fdf4' : '#fff',
                            color: pressureUnit === u ? '#10b981' : '#64748b',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase' as const
                          }}>{u}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── SECURITY ─── */}
              {activeSection === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={cardStyle}>
                    {sectionTitle('API Access Keys', Key, '#8b5cf6')}
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Gemini API Key</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          defaultValue="AIzaSy••••••••••••••••••••"
                          style={{ ...inputStyle, paddingRight: 40, fontFamily: 'monospace' }}
                        />
                        <button onClick={() => setShowApiKey(v => !v)} style={{
                          position: 'absolute', right: 10, background: 'none', border: 'none',
                          cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center'
                        }}>
                          {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 5 }}>Used for AI chatbot, Explainable AI, and multi-agent Gemini calls</p>
                    </div>
                    <div>
                      <label style={labelStyle}>OpenSwarm Orchestration Key</label>
                      <input type="password" defaultValue="OSK-••••••••••••" style={{ ...inputStyle, fontFamily: 'monospace' }} />
                    </div>
                  </div>

                  <div style={cardStyle}>
                    {sectionTitle('Session & Access Control', Lock, '#8b5cf6')}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>Two-Factor Authentication</div>
                        <div style={{ fontSize: 9, color: '#94a3b8' }}>Require OTP for each operator login session</div>
                      </div>
                      <Toggle checked={twoFactor} onChange={setTwoFactor} color="#8b5cf6" />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>Session Timeout (minutes)</label>
                      <select style={{ ...inputStyle, appearance: 'none', maxWidth: 200 }} value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                        <option value="0">Never (Not Recommended)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── SYSTEM ─── */}
              {activeSection === 'system' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={cardStyle}>
                    {sectionTitle('Veilon Platform Architecture', Cpu, '#ec4899')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { label: 'VEILON CORE ENGINE', value: 'v2.4.0-LTS', color: '#10b981' },
                        { label: 'INTERFACE STACK', value: 'React 19 + Vite 8 + TS', color: '#3b82f6' },
                        { label: 'AI AGENT RUNTIME', value: 'OpenSwarm v1.1', color: '#8b5cf6' },
                        { label: 'SIMULATION FPS', value: '1.0 Hz — NOMINAL', color: '#10b981' },
                        { label: 'ACTIVE NODES', value: '20 Devices', color: '#f59e0b' },
                        { label: 'WEBSOCKET STATUS', value: 'Connected ✓', color: '#10b981' },
                      ].map((row, i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>{row.label}</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: row.color, fontWeight: 700 }}>{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={cardStyle}>
                    {sectionTitle('Performance Preferences', Zap, '#ec4899')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Telemetry Refresh Rate</label>
                        <select style={{ ...inputStyle, appearance: 'none' }} value={refreshRate} onChange={e => setRefreshRate(e.target.value)}>
                          <option value="0.5">500ms (High Performance)</option>
                          <option value="1">1 second (Recommended)</option>
                          <option value="2">2 seconds (Balanced)</option>
                          <option value="5">5 seconds (Low Power)</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Data Retention Window</label>
                        <select style={{ ...inputStyle, appearance: 'none' }} value={dataRetention} onChange={e => setDataRetention(e.target.value)}>
                          <option value="7">7 days</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ── Action Buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
              <RotateCcw size={13} /> Discard
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 10, border: 'none',
                background: saved ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.3s ease',
                boxShadow: '0 4px 14px rgba(59,130,246,0.35)'
              }}>
              {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
};
