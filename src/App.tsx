import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { AiAssistant } from './components/AiAssistant';
import { FloatingAlerts } from './components/FloatingAlerts';

// Lazy load all pages for fast initial render & chunk splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const DigitalTwin = React.lazy(() => import('./pages/DigitalTwin').then(m => ({ default: m.DigitalTwin })));
const DeviceOps = React.lazy(() => import('./pages/DeviceOps').then(m => ({ default: m.DeviceOps })));
const Planner = React.lazy(() => import('./pages/Planner').then(m => ({ default: m.Planner })));
const AgentIntelligence = React.lazy(() => import('./pages/AgentIntelligence').then(m => ({ default: m.AgentIntelligence })));
const SwarmCenter = React.lazy(() => import('./pages/SwarmCenter').then(m => ({ default: m.SwarmCenter })));
const ExplainableAi = React.lazy(() => import('./pages/ExplainableAi').then(m => ({ default: m.ExplainableAi })));
const Alerts = React.lazy(() => import('./pages/Alerts').then(m => ({ default: m.Alerts })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AiControlCenter = React.lazy(() => import('./pages/AiControlCenter').then(m => ({ default: m.AiControlCenter })));

// Global Loading Spinner for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <SimulationProvider>
        {/* Responsive layout */}
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
          
          {/* Mobile Sidebar Overlay Backdrop */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Left Sidebar — Desktop & Mobile Drawer */}
          <div className={`
            fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            flex-shrink-0
          `}>
             <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} closeMobile={() => setMobileMenuOpen(false)} />
          </div>

          {/* Right body */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <TopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 relative scroll-smooth">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/digital-twin" element={<DigitalTwin />} />
                  <Route path="/device-operations" element={<DeviceOps />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/agent-intelligence" element={<AgentIntelligence />} />
                  <Route path="/swarm-center" element={<SwarmCenter />} />
                  <Route path="/explainable-ai" element={<ExplainableAi />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/governance" element={<AiControlCenter />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>

        {/* Floating overlays */}
        <AiAssistant />
        <FloatingAlerts />
      </SimulationProvider>
    </BrowserRouter>
  );
};

export default App;
