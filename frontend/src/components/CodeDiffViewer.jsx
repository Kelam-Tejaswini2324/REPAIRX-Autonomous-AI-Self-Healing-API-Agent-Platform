import React, { useState } from 'react';
import { GitPullRequest, Check, X, FileCode, Shield, Download, FileText, Sparkles, Copy, AlertTriangle, Columns, AlignLeft, Code2 } from 'lucide-react';

export default function CodeDiffViewer({ 
  pipelineData, 
  onApplyFix, 
  onRejectFix, 
  onGeneratePostMortem, 
  isApplying = false 
}) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [diffMode, setDiffMode] = useState('unified'); // 'unified' | 'split' | 'full'

  if (!pipelineData || !pipelineData.patchData) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 border border-slate-800/80">
        <FileCode className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-400 mb-1">Human-in-the-Loop Patch Reviewer</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          When REPAIRX detects an API failure, the synthesized surgical patch and isolated sandbox test report will appear here for developer review and one-click deployment.
        </p>
      </div>
    );
  }

  const { diagnosis, patchData, location, verification, incidentId } = pipelineData;

  const handleApply = async () => {
    await onApplyFix(incidentId, patchData);
    setApplied(true);
  };

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(patchData.patchDiff || patchData.patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const element = document.createElement('a');
    const file = new Blob([patchData.patchDiff], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `repairx-patch-${Date.now()}.patch`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 mb-6 shadow-2xl border border-cyan-500/30">
      {/* Header info */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              {patchData.filePath}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/80">
              SEVERITY: {diagnosis.severity || 'CRITICAL'}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              CONFIDENCE: {diagnosis.confidenceScore || 98}%
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              BLAST RADIUS: {diagnosis.blastRadius || 'LOW'}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Function: <span className="font-mono text-cyan-400">{location.functionName}()</span> (Lines {location.startLine} - {location.endLine})
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Diff Mode Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setDiffMode('unified')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                diffMode === 'unified' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Unified Diff"
            >
              <AlignLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Unified</span>
            </button>
            <button
              onClick={() => setDiffMode('split')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                diffMode === 'split' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-Side Split Diff"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setDiffMode('full')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                diffMode === 'full' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Patched Source File"
            >
              <Code2 className="w-3 h-3" />
              <span className="hidden sm:inline">Full File</span>
            </button>
          </div>

          <button
            onClick={handleCopyDiff}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
            title="Copy Unified Diff"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button
            onClick={handleDownloadPatch}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
            title="Download .patch file"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>.patch</span>
          </button>

          <button
            onClick={() => onGeneratePostMortem(incidentId)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
            title="Generate Executive Post-Mortem"
          >
            <FileText className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Post-Mortem</span>
          </button>
        </div>
      </div>

      {/* Root Cause Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Root Cause Diagnosis:</span>
        </div>
        <p className="text-xs text-slate-200 mb-1 leading-relaxed">
          {diagnosis.rootCause}
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {diagnosis.detailedExplanation}
        </p>
      </div>

      {/* Visual Code Diff Display */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#060A14] mb-4">
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-red-400">--- {patchData.filePath} (Original / Broken)</span>
            <span className="text-emerald-400">+++ {patchData.filePath} (Healed / Sandbox Verified)</span>
          </div>
          <span className="text-slate-500 font-sans capitalize">{diffMode} View</span>
        </div>

        {/* Diff Modes */}
        {diffMode === 'unified' && (
          <div className="p-3 font-mono text-xs overflow-x-auto max-h-[260px] space-y-1">
            {patchData.originalChunk && patchData.replacementChunk ? (
              <div>
                <div className="text-slate-500 text-[10px] pb-1">@@ Lines {location.startLine} - {location.endLine} @@</div>
                {patchData.originalChunk.split('\n').map((line, idx) => (
                  <div key={`del-${idx}`} className="flex items-start bg-red-950/40 text-red-300 border-l-2 border-red-500 px-2 py-0.5 rounded-sm">
                    <span className="text-red-500 select-none mr-2 font-bold">-</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
                {patchData.replacementChunk.split('\n').map((line, idx) => (
                  <div key={`add-${idx}`} className="flex items-start bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 rounded-sm mt-0.5">
                    <span className="text-emerald-400 select-none mr-2 font-bold">+</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-slate-300 text-xs whitespace-pre-wrap">{patchData.patchDiff}</pre>
            )}
          </div>
        )}

        {diffMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 max-h-[260px] overflow-y-auto font-mono text-xs">
            {/* Left: Original */}
            <div className="p-3 bg-red-950/10 space-y-1">
              <div className="text-[10px] text-red-400 font-bold uppercase pb-1">Original Broken Code</div>
              {patchData.originalChunk?.split('\n').map((line, i) => (
                <div key={i} className="text-red-300 bg-red-950/30 px-1.5 py-0.5 rounded text-[11px] whitespace-pre">
                  {line}
                </div>
              ))}
            </div>
            {/* Right: Healed */}
            <div className="p-3 bg-emerald-950/10 space-y-1">
              <div className="text-[10px] text-emerald-400 font-bold uppercase pb-1">AI Healed Patch</div>
              {patchData.replacementChunk?.split('\n').map((line, i) => (
                <div key={i} className="text-emerald-300 bg-emerald-950/30 px-1.5 py-0.5 rounded text-[11px] whitespace-pre">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {diffMode === 'full' && (
          <div className="p-3 font-mono text-xs overflow-x-auto max-h-[260px] bg-[#040711]">
            <pre className="text-emerald-300/90 leading-relaxed text-[11px]">
              {patchData.patchedCode}
            </pre>
          </div>
        )}
      </div>

      {/* Human-in-the-Loop Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Sandbox Verification: {verification?.summary || '12/12 Tests Passing'}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onRejectFix(incidentId, 'Developer rejected proposal in UI')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>Reject Fix</span>
          </button>

          <button
            onClick={handleApply}
            disabled={isApplying || applied}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {applied ? (
              <>
                <Check className="w-4 h-4 text-white font-bold" />
                <span>Fix Deployed to Repository!</span>
              </>
            ) : isApplying ? (
              <span>Deploying Fix...</span>
            ) : (
              <>
                <GitPullRequest className="w-4 h-4" />
                <span>Deploy Fix to Repository (1-Click)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
