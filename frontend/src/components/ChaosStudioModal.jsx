import React, { useState, useEffect } from 'react';
import { X, Zap, AlertTriangle, ShieldCheck, Play, Check, Flame, Layers } from 'lucide-react';

export default function ChaosStudioModal({ isOpen, onClose, onInjectBug, onResetAll, activeBug }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/chaos/scenarios')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setScenarios(data.scenarios);
            setSelectedScenario(data.scenarios[0]);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInject = async (scenario) => {
    setLoadingId(scenario.id);
    await onInjectBug(scenario.id);
    setLoadingId(null);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">MEDIUM</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-red-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-red-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white uppercase">
                  Chaos Studio: "Break My API" Playground
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700/60">
                  Live Bug Injector
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Test REPAIRX against 6 realistic production failure modes without risking live infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Restore Healthy State</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Split: Scenarios List & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left: Scenarios List (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800/80 overflow-y-auto p-4 space-y-2 bg-[#060A14]/70">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Select A Failure Scenario
            </div>

            {scenarios.map((sc) => {
              const isSelected = selectedScenario?.id === sc.id;
              const isActive = activeBug?.id === sc.id;

              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {sc.method}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 leading-snug">{sc.name}</h4>
                    </div>
                    {getSeverityBadge(sc.severity)}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                    {sc.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                    <span className="text-slate-500 truncate max-w-[170px]">{sc.endpoint}</span>
                    {isActive ? (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400 animate-pulse" /> ACTIVE BUG
                      </span>
                    ) : (
                      <span className="text-slate-500">Ready to inject</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Scenario Deep Dive & Inject Action (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-[#090E1A]/90 flex flex-col justify-between">
            {selectedScenario ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Scenario Blueprint
                    </span>
                    {getSeverityBadge(selectedScenario.severity)}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{selectedScenario.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedScenario.description}</p>
                </div>

                {/* Target File & Endpoint Details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Target Endpoint</span>
                    <span className="text-cyan-400 font-bold">{selectedScenario.method} {selectedScenario.endpoint}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Offending File</span>
                    <span className="text-slate-300 font-semibold">{selectedScenario.file}</span>
                  </div>
                </div>

                {/* Impact Statement */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                  <span className="text-amber-400 font-bold block mb-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Production Blast Radius & Impact
                  </span>
                  <p className="text-amber-200/80 text-[11px] leading-relaxed">{selectedScenario.impact}</p>
                </div>

                {/* Code Snippet Comparison */}
                <div className="rounded-xl overflow-hidden border border-slate-800 text-xs font-mono">
                  <div className="px-3 py-1.5 bg-red-950/60 text-red-300 font-bold text-[11px] border-b border-slate-800 flex items-center gap-1">
                    <span>🔴 Injected Broken Code:</span>
                  </div>
                  <pre className="p-3 bg-[#040711] text-red-300 overflow-x-auto text-[11px]">
                    {selectedScenario.brokenSnippet}
                  </pre>
                </div>

                {/* Inject Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleInject(selectedScenario)}
                    disabled={loadingId === selectedScenario.id}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Zap className="w-4 h-4 text-amber-200 fill-current" />
                    <span>
                      {loadingId === selectedScenario.id ? 'Injecting Chaos...' : `Inject "${selectedScenario.name}" into Live API`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Select a scenario to preview details.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
