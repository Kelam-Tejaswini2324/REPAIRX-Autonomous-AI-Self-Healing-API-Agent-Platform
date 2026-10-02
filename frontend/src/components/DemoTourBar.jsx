import React, { useState } from 'react';
import { PlayCircle, Flame, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, FileText, RotateCcw } from 'lucide-react';

export default function DemoTourBar({
  onInjectScenario,
  onRunRepair,
  onOpenChaos,
  onOpenAnalytics,
  onOpenRollback,
  onOpenContractDrift,
  pipelineData,
  activeBug,
  isRunning
}) {
  const [demoStep, setDemoStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const handleStartAutoDemo = async () => {
    setIsAutoPlaying(true);

    // Step 1: Inject Bug 1 (Param Mismatch)
    setDemoStep(1);
    await onInjectScenario('BUG_1_PARAM_MISMATCH');

    // Wait 1.2s then Step 2: Trigger Auto-Heal
    setTimeout(async () => {
      setDemoStep(2);
      await onRunRepair({
        method: 'GET',
        url: 'http://localhost:5000/target-api/api/v1/users/101'
      });
      setDemoStep(3);
      setIsAutoPlaying(false);
    }, 1200);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Guided Pitch Banner */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                1-Click Investor & Hackathon Demo Mode
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Guided Flow
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Observe REPAIRX detect a 500 error, diagnose AST root cause, synthesize a patch, and verify in an isolated sandbox.
            </p>
          </div>
        </div>

        {/* Center/Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          <button
            onClick={handleStartAutoDemo}
            disabled={isRunning || isAutoPlaying}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <PlayCircle className={`w-4 h-4 ${isAutoPlaying ? 'animate-spin' : ''}`} />
            <span>{isAutoPlaying ? 'Running Auto-Demo...' : '⚡ Run 1-Click Live Demo'}</span>
          </button>

          <button
            onClick={onOpenContractDrift}
            className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            title="Inspect OpenAPI 3.0 Contract Specification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">OpenAPI Contract</span>
          </button>

          <button
            onClick={onOpenRollback}
            className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            title="View Git-Style Version Snapshots & Rollback"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Snapshots & Rollback</span>
          </button>
        </div>

      </div>
    </div>
  );
}
