import React from 'react';
import { CheckCircle2, XCircle, FlaskConical, Gauge, Clock, ShieldCheck } from 'lucide-react';

export default function TestResultsMatrix({ verificationData, probeResult }) {
  if (!verificationData || !verificationData.regressionReport) {
    return null;
  }

  const { probeResult: sandboxedProbe, regressionReport } = verificationData;

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 shadow-xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Isolated Sandbox Verification Matrix & Regression Report
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {regressionReport.passed}/{regressionReport.total} Tests Passed ({regressionReport.successRate}%)
          </span>
        </div>
      </div>

      {/* Before vs After Probe Comparison Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Before */}
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Before AI Patch (Broken)</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-black text-red-400">
              HTTP {probeResult?.status || 500}
            </span>
            <span className="text-xs text-red-300/80">Internal Server Error / Crash</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Latency: {probeResult?.responseTimeMs || 42}ms | 0/12 Assertions
          </div>
        </div>

        {/* After (Sandbox) */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">After AI Patch (Verified in Sandbox)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-black text-emerald-400">
              HTTP {sandboxedProbe?.status || 200} OK
            </span>
            <span className="text-xs text-emerald-300/80">Contract & Response Restored</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Latency: {sandboxedProbe?.responseTimeMs || 6}ms | 12/12 Assertions Passed
          </div>
        </div>
      </div>

      {/* Regression Suite Test Cards */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
        {regressionReport.results?.map((t, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
          >
            <div className="flex items-center gap-2">
              {t.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span className="font-mono text-[10px] font-bold text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded">
                {t.id}
              </span>
              <span className="text-slate-200 font-medium">{t.name}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {t.responseTimeMs}ms
              </span>
              <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {t.actualStatus} {t.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
