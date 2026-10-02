import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, Shield, Circle, Sparkles, Filter } from 'lucide-react';

export default function AgentTerminalStream({ logs = [], onClear }) {
  const [filter, setFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp?.split('T')[1]?.slice(0, 8) || ''}] [${l.agent?.toUpperCase() || 'SYS'}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAgentBadge = (agent) => {
    switch (agent?.toLowerCase()) {
      case 'detective':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/60 font-bold">DETECTIVE</span>;
      case 'code_locator':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-900/60 text-teal-300 border border-teal-700/60 font-bold">LOCATOR</span>;
      case 'root_cause':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-900/60 text-purple-300 border border-purple-700/60 font-bold">ROOT_CAUSE</span>;
      case 'repair':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-900/60 text-amber-300 border border-amber-700/60 font-bold">REPAIR</span>;
      case 'verification':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold">SANDBOX</span>;
      case 'chaos':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-900/60 text-red-300 border border-red-700/60 font-bold">CHAOS</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 font-bold">SYSTEM</span>;
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    return l.agent?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 flex flex-col h-[340px]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-300">
              agent-stream://live-telemetry
            </span>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            {['ALL', 'detective', 'root_cause', 'repair', 'verification'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded capitalize transition-all ${
                  filter === f 
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
            title="Copy Terminal Logs"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onClear}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
            title="Clear Stream"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[#040810]/95">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
            <p className="text-xs">Agent telemetry stream waiting for probe trigger...</p>
            <p className="text-[10px] text-slate-600">Enter an API endpoint above or select a Chaos Preset to begin.</p>
          </div>
        ) : (
          filteredLogs.map((log, i) => {
            const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
            return (
              <div key={i} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/40 px-1 py-0.5 rounded">
                <span className="text-slate-600 text-[10px] select-none pt-0.5">{time}</span>
                <span className="pt-0.5">{getAgentBadge(log.agent)}</span>
                <div className="flex-1 text-slate-200 break-words">
                  {log.message?.startsWith('---') || log.message?.startsWith('+++') || log.message?.startsWith('@@') ? (
                    <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
                      {log.message}
                    </pre>
                  ) : log.error ? (
                    <span className="text-red-400 font-semibold">{log.message}</span>
                  ) : log.message?.includes('PASSED') || log.message?.includes('200 OK') || log.message?.includes('100%') ? (
                    <span className="text-emerald-300 font-semibold">{log.message}</span>
                  ) : log.message?.includes('FAILURE') || log.message?.includes('CastError') || log.message?.includes('500') ? (
                    <span className="text-amber-300 font-medium">{log.message}</span>
                  ) : (
                    <span>{log.message}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
