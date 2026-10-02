import React from 'react';
import { Search, MapPin, BrainCircuit, Wrench, FlaskConical, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AgentPipelineVisualizer({ currentStep = 0, pipelineData = null, isRunning = false }) {
  const steps = [
    {
      id: 1,
      title: 'Detective Agent',
      subtitle: 'Failure Detection & Telemetry',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      activeColor: 'text-cyan-400 border-cyan-500 shadow-cyan-500/30',
      details: pipelineData?.probeResult ? (
        pipelineData.probeResult.status ? (
          <span className="text-red-400 font-mono font-bold">
            HTTP {pipelineData.probeResult.status} Failure Detected
          </span>
        ) : 'Status Captured'
      ) : 'Observing HTTP probe...'
    },
    {
      id: 2,
      title: 'Code Locator',
      subtitle: 'AST File & Line Mapping',
      icon: MapPin,
      color: 'from-cyan-500 to-teal-500',
      activeColor: 'text-teal-400 border-teal-500 shadow-teal-500/30',
      details: pipelineData?.location?.filePath ? (
        <span className="font-mono text-teal-300 truncate max-w-[140px] block">
          {pipelineData.location.filePath.split('/').pop()}:{pipelineData.location.startLine}
        </span>
      ) : 'AST Symbol Traversal'
    },
    {
      id: 3,
      title: 'Root Cause Agent',
      subtitle: 'Gemini AI Semantic Reasoner',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-500',
      activeColor: 'text-purple-400 border-purple-500 shadow-purple-500/30',
      details: pipelineData?.diagnosis?.confidenceScore ? (
        <span className="text-pink-300 font-semibold">
          {pipelineData.diagnosis.confidenceScore}% Confidence
        </span>
      ) : 'Semantic Reasoning'
    },
    {
      id: 4,
      title: 'Repair Agent',
      subtitle: 'Surgical Unified Patch',
      icon: Wrench,
      color: 'from-amber-500 to-orange-500',
      activeColor: 'text-amber-400 border-amber-500 shadow-amber-500/30',
      details: pipelineData?.patchData ? (
        <span className="text-amber-300 font-mono">
          Unified Diff Generated
        </span>
      ) : 'Synthesizing Patch'
    },
    {
      id: 5,
      title: 'Verification Agent',
      subtitle: 'Sandbox Regression Suite',
      icon: FlaskConical,
      color: 'from-emerald-500 to-green-500',
      activeColor: 'text-emerald-400 border-emerald-500 shadow-emerald-500/30',
      details: pipelineData?.verification?.regressionReport ? (
        <span className="text-emerald-300 font-bold font-mono">
          {pipelineData.verification.regressionReport.passed}/{pipelineData.verification.regressionReport.total} Tests Passed
        </span>
      ) : 'Running Sandbox Tests'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 shadow-xl border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Autonomous 5-Agent Self-Healing Pipeline
          </h3>
        </div>
        {pipelineData?.durationSeconds && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300">
            <Clock className="w-3 h-3" />
            <span>MTTR: {pipelineData.durationSeconds}s</span>
          </div>
        )}
      </div>

      {/* Agents Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id || (pipelineData && !isRunning);
          const isCurrent = isRunning && currentStep === step.id;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-300 ${
                isCurrent 
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10 scale-[1.02]' 
                  : isCompleted 
                  ? 'bg-slate-900/60 border-slate-700/80' 
                  : 'bg-slate-950/30 border-slate-800/50 opacity-60'
              }`}
            >
              {/* Step indicator top */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500 font-semibold">
                0{step.id}
              </div>

              {/* Agent Icon Badge */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 shadow-md transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Agent Title & Details */}
              <h4 className="text-xs font-bold text-slate-200 mb-0.5">
                {step.title}
              </h4>
              <p className="text-[10px] text-slate-400 mb-1.5 leading-tight">
                {step.subtitle}
              </p>

              {/* Live Status Chip */}
              <div className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800/80 w-full truncate">
                {isCurrent ? (
                  <span className="text-cyan-400 font-semibold animate-pulse">Running...</span>
                ) : isCompleted ? (
                  step.details
                ) : (
                  <span className="text-slate-500">Standby</span>
                )}
              </div>

              {/* Connector line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-700/60 z-10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
