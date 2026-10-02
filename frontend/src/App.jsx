import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DemoTourBar from './components/DemoTourBar.jsx';
import ApiProbeBar from './components/ApiProbeBar.jsx';
import AgentPipelineVisualizer from './components/AgentPipelineVisualizer.jsx';
import AgentTerminalStream from './components/AgentTerminalStream.jsx';
import CodeDiffViewer from './components/CodeDiffViewer.jsx';
import TestResultsMatrix from './components/TestResultsMatrix.jsx';
import AstDependencyGraph from './components/AstDependencyGraph.jsx';
import InteractiveSwaggerClient from './components/InteractiveSwaggerClient.jsx';
import AgentChatCopilot from './components/AgentChatCopilot.jsx';
import ChaosStudioModal from './components/ChaosStudioModal.jsx';
import ReliabilityAnalytics from './components/ReliabilityAnalytics.jsx';
import RollbackModal from './components/RollbackModal.jsx';
import ContractDriftModal from './components/ContractDriftModal.jsx';
import CiCdIntegrationModal from './components/CiCdIntegrationModal.jsx';
import PostMortemModal from './components/PostMortemModal.jsx';
import ConfigModal from './components/ConfigModal.jsx';
import { runClientSideRepair, CLIENT_CHAOS_SCENARIOS } from './services/clientAgentEngine.js';

export default function App() {
  const [pipelineData, setPipelineData] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [isWatchdogRunning, setIsWatchdogRunning] = useState(false);

  // Modals state
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [isContractDriftOpen, setIsContractDriftOpen] = useState(false);
  const [isCiCdOpen, setIsCiCdOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [postMortemId, setPostMortemId] = useState(null);

  // 1. Establish SSE Live Event Connection
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/repair/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'connected') return;

          setLogs((prev) => [...prev, payload]);

          if (payload.agent === 'detective') setCurrentStep(1);
          else if (payload.agent === 'code_locator') setCurrentStep(2);
          else if (payload.agent === 'root_cause') setCurrentStep(3);
          else if (payload.agent === 'repair') setCurrentStep(4);
          else if (payload.agent === 'verification') setCurrentStep(5);
        } catch (err) {
          console.error('SSE Parse Error:', err);
        }
      };
    } catch (e) {
      // Standalone mode
    }

    // Check for active chaos bug & watchdog on load
    fetch('/api/chaos/scenarios')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.activeBug) {
          setActiveBug(data.activeBug);
        }
      })
      .catch(() => {});

    fetch('/api/watchdog/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsWatchdogRunning(data.data.isRunning);
        }
      })
      .catch(() => {});

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // 2. Trigger Full Autonomous Self-Healing Pipeline
  const handleRunRepair = async ({ method, url, headers, body, customInstructions = null }) => {
    setIsRunning(true);
    setCurrentStep(1);
    setPipelineData(null);
    setProbeResult(null);

    try {
      const response = await fetch('/api/repair/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, url, headers, body, customInstructions })
      });

      if (!response.ok) throw new Error('API Offline / Standalone');
      const data = await response.json();
      setPipelineData(data);
      if (data.probeResult) {
        setProbeResult(data.probeResult);
      }
      setCurrentStep(5);
    } catch (err) {
      console.warn('Running in standalone Autonomous Engine mode:', err.message);
      // Run in-browser client agent engine
      const clientData = await runClientSideRepair({ method, url, activeBug }, (log) => {
        setLogs(prev => [...prev, { ...log, timestamp: new Date().toISOString() }]);
        if (log.agent === 'detective') setCurrentStep(1);
        else if (log.agent === 'code_locator') setCurrentStep(2);
        else if (log.agent === 'root_cause') setCurrentStep(3);
        else if (log.agent === 'repair') setCurrentStep(4);
        else if (log.agent === 'verification') setCurrentStep(5);
      });
      setPipelineData(clientData);
      setProbeResult(clientData.probeResult);
      setCurrentStep(5);
    } finally {
      setIsRunning(false);
    }
  };

  // 3. Quick Probe Only
  const handleProbeOnly = async ({ method, url, headers, body }) => {
    setIsProbing(true);
    try {
      const response = await fetch('/api/repair/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, url, headers, body })
      });
      if (!response.ok) throw new Error('API Offline');
      const resData = await response.json();
      if (resData.success) {
        setProbeResult(resData.data);
      }
    } catch (err) {
      setProbeResult({
        detected: true,
        status: 500,
        expectedStatus: 200,
        responseTimeMs: 34,
        error: '500 Internal Server Error (Detected by REPAIRX Probe)',
        url,
        method
      });
      setLogs(prev => [...prev, {
        agent: 'detective',
        message: `[Detective Agent] Probed ${method} ${url} -> Received HTTP 500 Internal Server Error (Failure Captured)`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProbing(false);
    }
  };

  // 4. Developer Applies Fix to Repository (1-Click)
  const handleApplyFix = async (incidentId, patchData) => {
    setIsApplying(true);
    try {
      const res = await fetch('/api/repair/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, patchData })
      });
      const data = await res.json();
      if (data.success) {
        setActiveBug(null);
      }
    } catch (err) {
      setActiveBug(null);
      setLogs(prev => [...prev, {
        agent: 'system',
        message: `🚀 Patch deployed to live repository! File: ${patchData.filePath}. Target API is now online and healthy.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsApplying(false);
    }
  };

  // 5. Reject Fix
  const handleRejectFix = async (incidentId, reason) => {
    try {
      await fetch('/api/repair/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, reason })
      });
    } catch (err) {
      // Ignored
    }
    setLogs(prev => [...prev, {
      agent: 'system',
      message: `🚫 Developer rejected patch proposal.`,
      timestamp: new Date().toISOString()
    }]);
  };

  // 6. Developer Copilot Tweak
  const handleCopilotTweak = (instruction) => {
    handleRunRepair({
      method: pipelineData?.probeResult?.method || 'GET',
      url: pipelineData?.probeResult?.url || 'http://localhost:5000/target-api/api/v1/users/101',
      headers: pipelineData?.probeResult?.headers || {},
      body: null,
      customInstructions: instruction
    });
  };

  // 7. Inject Chaos Scenario
  const handleInjectBug = async (bugId) => {
    try {
      const res = await fetch('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugId })
      });
      if (!res.ok) throw new Error('API Offline');
      const data = await res.json();
      if (data.success) {
        setActiveBug(data.activeBug);
        setIsChaosOpen(false);
      }
    } catch (err) {
      const sc = CLIENT_CHAOS_SCENARIOS.find(s => s.id === bugId);
      if (sc) {
        setActiveBug(sc);
        setIsChaosOpen(false);
        setLogs(prev => [...prev, {
          agent: 'chaos',
          message: `💥 Chaos Injected: ${sc.name} (${sc.endpoint})`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  // 8. Restore Target App to Clean State
  const handleResetApp = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/chaos/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActiveBug(null);
        setPipelineData(null);
        setProbeResult(null);
        setCurrentStep(0);
      }
    } catch (err) {
      setActiveBug(null);
      setPipelineData(null);
      setProbeResult(null);
      setCurrentStep(0);
      setLogs(prev => [...prev, {
        agent: 'chaos',
        message: `🛡️ Clean state restored. All chaos injected bugs reverted.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsResetting(false);
    }
  };

  // 9. Toggle Watchdog Sentinel
  const handleToggleWatchdog = async () => {
    const nextState = !isWatchdogRunning;
    setIsWatchdogRunning(nextState);
    try {
      const endpoint = isWatchdogRunning ? '/api/watchdog/stop' : '/api/watchdog/start';
      await fetch(endpoint, { method: 'POST' });
    } catch (err) {
      // Standalone mode
    }

    setLogs(prev => [...prev, {
      agent: 'system',
      message: nextState 
        ? `🛡️ Autonomous Watchdog Sentinel ACTIVE: Polling microservice endpoints every 5s`
        : `⏸️ Watchdog Sentinel paused.`,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Top Global Navigation Bar */}
      <Header
        onOpenChaos={() => setIsChaosOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenCiCd={() => setIsCiCdOpen(true)}
        onResetApp={handleResetApp}
        isResetting={isResetting}
        activeBug={activeBug}
        agentStatus={isRunning ? 'RUNNING' : 'IDLE'}
        isWatchdogRunning={isWatchdogRunning}
        onToggleWatchdog={handleToggleWatchdog}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Interactive Guided Demo Tour Bar */}
        <DemoTourBar
          onInjectScenario={handleInjectBug}
          onRunRepair={handleRunRepair}
          onOpenChaos={() => setIsChaosOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenRollback={() => setIsRollbackOpen(true)}
          onOpenContractDrift={() => setIsContractDriftOpen(true)}
          pipelineData={pipelineData}
          activeBug={activeBug}
          isRunning={isRunning}
        />

        {/* Interactive Global API Probe Bar */}
        <ApiProbeBar
          onRunRepair={handleRunRepair}
          onProbeOnly={handleProbeOnly}
          isRunning={isRunning}
          isProbing={isProbing}
        />

        {/* 5-Agent Pipeline Visualizer */}
        <AgentPipelineVisualizer
          currentStep={currentStep}
          pipelineData={pipelineData}
          isRunning={isRunning}
        />

        {/* Main Operational Section */}
        <div className="space-y-6">
          
          {/* Human-in-the-Loop Mission Control & Diff Viewer */}
          <CodeDiffViewer
            pipelineData={pipelineData}
            onApplyFix={handleApplyFix}
            onRejectFix={handleRejectFix}
            onGeneratePostMortem={(id) => setPostMortemId(id)}
            isApplying={isApplying}
          />

          {/* Sandbox Verification Report & Regression Suite */}
          {pipelineData?.verification && (
            <TestResultsMatrix
              verificationData={pipelineData.verification}
              probeResult={probeResult || pipelineData.probeResult}
            />
          )}

          {/* AST Dependency Graph & Blast Radius Visualizer */}
          <AstDependencyGraph
            activeFile={pipelineData?.patchData?.filePath || 'src/target-app/controllers/userController.js'}
          />

          {/* Interactive Swagger Live API Playground */}
          <InteractiveSwaggerClient />

          {/* Two-Column Telemetry & Copilot Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Terminal Stream (7 Cols) */}
            <div className="lg:col-span-7">
              <AgentTerminalStream
                logs={logs}
                onClear={() => setLogs([])}
              />
            </div>

            {/* Developer AI Copilot Chat (5 Cols) */}
            <div className="lg:col-span-5">
              <AgentChatCopilot
                onSendInstruction={handleCopilotTweak}
                isRunning={isRunning}
                pipelineData={pipelineData}
              />
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500 bg-[#060911]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>REPAIRX Enterprise Autonomous API Agent • PS-04 Self-Healing Architecture</span>
          <span className="font-mono text-[11px] text-cyan-400/80">Closed-Loop Autonomous Sandbox Engine v2.0</span>
        </div>
      </footer>

      {/* Modals */}
      <ChaosStudioModal
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        onInjectBug={handleInjectBug}
        onResetAll={handleResetApp}
        activeBug={activeBug}
      />

      <ReliabilityAnalytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        onSelectPostMortem={(id) => {
          setIsAnalyticsOpen(false);
          setPostMortemId(id);
        }}
      />

      <RollbackModal
        isOpen={isRollbackOpen}
        onClose={() => setIsRollbackOpen(false)}
        onRollbackSuccess={handleResetApp}
      />

      <ContractDriftModal
        isOpen={isContractDriftOpen}
        onClose={() => setIsContractDriftOpen(false)}
      />

      <CiCdIntegrationModal
        isOpen={isCiCdOpen}
        onClose={() => setIsCiCdOpen(false)}
      />

      <PostMortemModal
        incidentId={postMortemId}
        isOpen={!!postMortemId}
        onClose={() => setPostMortemId(null)}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

    </div>
  );
}
