import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';

// Pages imports
import { Dashboard } from './pages/Dashboard';
import { DigitalTwin } from './pages/DigitalTwin';
import { DeviceOps } from './pages/DeviceOps';
import { Planner } from './pages/Planner';
import { AgentIntelligence } from './pages/AgentIntelligence';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { AiControlCenter } from './pages/AiControlCenter';
import { SwarmCenter } from './pages/SwarmCenter';
import { ExplainableAi } from './pages/ExplainableAi';
import { AiAssistant } from './components/AiAssistant';
import { FloatingAlerts } from './components/FloatingAlerts';

export const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <SimulationProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAFBFC' }}>
          {/* Left Sidebar — sticky, never clipped */}
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

          {/* Right body — scrolls independently */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <TopNav />
            <main style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative' }}>
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
