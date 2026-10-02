import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ContractDriftModal({ isOpen, onClose }) {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/schema/openapi')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSpec(data.data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-cyan-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white uppercase">
                OpenAPI 3.0 Contract & Schema Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Detects schema drift between API contracts and runtime controller execution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 font-sans text-xs text-cyan-200 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Active Contract Guardian</span>
            </div>
            REPAIRX cross-validates runtime responses against standard OpenAPI 3.0 definitions. When route parameters or response types drift, the Detective and Root Cause Agents flag contract non-compliance.
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#060A14]">
            <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 font-sans font-semibold">
              OpenAPI 3.0.3 Contract Definition
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-[300px]">
              {spec ? JSON.stringify(spec, null, 2) : 'Loading OpenAPI specification...'}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
