import React, { useState } from 'react';
import { X, Key, Sparkles, Check, Cpu } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      const res = await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl w-full max-w-md overflow-hidden flex flex-col border border-cyan-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              AI Model & API Configuration
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
            <Sparkles className="w-4 h-4 text-cyan-400 mb-1" />
            REPAIRX features a dual-engine architecture: It automatically runs with Google Gemini 2.5 Flash when an API Key is provided, or seamlessly switches to the deterministic AST Semantic Heuristic Engine without requiring an API key.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Keys are stored in-memory for the current agent session.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>API Key Configured!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
