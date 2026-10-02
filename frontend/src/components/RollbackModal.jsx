import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Clock, FileCode, Check, AlertCircle } from 'lucide-react';

export default function RollbackModal({ isOpen, onClose, onRollbackSuccess }) {
  const [snapshots, setSnapshots] = useState([]);
  const [rollingBackId, setRollingBackId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/repair/snapshots')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSnapshots(data.data || []);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRollback = async (snapshotId) => {
    setRollingBackId(snapshotId);
    try {
      const res = await fetch('/api/repair/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        if (onRollbackSuccess) onRollbackSuccess();
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRollingBackId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-purple-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white uppercase">
                Git-Style Snapshots & Atomic Rollback
              </h2>
              <p className="text-xs text-slate-400">
                Restore previous pre-patch source code checkpoints with 1-click safety.
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
        <div className="p-6 overflow-y-auto space-y-3">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {snapshots.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No version snapshots saved yet.</p>
              <p className="text-[10px] text-slate-600">Snapshots are automatically created whenever a patch is deployed to the repository.</p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-400">{snap.id}</span>
                    <span className="font-semibold text-slate-200">{snap.title}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>{snap.filePath}</span>
                    <span className="text-slate-600">•</span>
                    <span>{new Date(snap.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRollback(snap.id)}
                  disabled={rollingBackId === snap.id}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${rollingBackId === snap.id ? 'animate-spin' : ''}`} />
                  <span>{rollingBackId === snap.id ? 'Rolling back...' : 'Rollback Checkpoint'}</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
