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
        <div className="flex min-h-screen bg-primary">
          {/* Left Sidebar Layout */}
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

          {/* Core Body Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Layout */}
            <TopNav />

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto relative">
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

        {/* Floating AI copilot & Alarm system */}
        <AiAssistant />
        <FloatingAlerts />
      </SimulationProvider>
    </BrowserRouter>
  );
};

export default App;
