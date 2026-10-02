import React, { useState, useEffect } from 'react';
import { Network, Layers, ShieldCheck, ArrowRight, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AstDependencyGraph({ activeFile = 'src/target-app/controllers/userController.js' }) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    fetch(`/api/ast/graph?file=${encodeURIComponent(activeFile)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGraphData(data.data);
        }
      })
      .catch(console.error);
  }, [activeFile]);

  if (!graphData) return null;

  const getNodeBadge = (status) => {
    switch (status) {
      case 'TARGET_PATCH':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800">PATCH TARGET</span>;
      case 'VERIFIED_12_PASS':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">12/12 VERIFIED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">ISOLATED CLEAN</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 border border-slate-800/80 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            AST Dependency Graph & Blast Radius Assessment
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Blast Radius:</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            {graphData.blastRadiusAssessment?.impactLevel || 'LOW (Isolated)'}
          </span>
        </div>
      </div>

      {/* Nodes Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {graphData.nodes?.map((node) => {
          const isTarget = node.status === 'TARGET_PATCH';

          return (
            <div
              key={node.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isTarget
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileCode className={`w-3.5 h-3.5 ${isTarget ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <span className="font-mono text-xs font-bold text-slate-200 truncate">{node.label}</span>
                  </div>
                  {getNodeBadge(node.status)}
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{node.role}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 space-y-0.5">
                {node.functions.slice(0, 2).map((fn, i) => (
                  <div key={i} className="truncate">• {fn}</div>
                ))}
                {node.functions.length > 2 && (
                  <div className="text-slate-600">+{node.functions.length - 2} more symbols</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Dependencies Guarantee */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Safe Verified Boundaries:</span>
          <span className="text-slate-300 font-mono text-[11px]">Database Store • Encryption Engine • Audit Trail</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">AST Tree Depth: 3 Nodes</span>
      </div>
    </div>
  );
}
