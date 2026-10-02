import React, { useState, useEffect } from 'react';
import { X, GitBranch, Copy, Download, Check, Sparkles, Terminal } from 'lucide-react';

export default function CiCdIntegrationModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [tab, setTab] = useState('github'); // 'github' | 'precommit'

  useEffect(() => {
    if (isOpen) {
      fetch('/api/cicd/templates')
        .then(res => res.json())
        .then(d => {
          if (d.success) setData(d);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(data.githubYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleCopyHook = () => {
    navigator.clipboard.writeText(data.preCommitScript);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleDownloadYaml = () => {
    const element = document.createElement('a');
    const file = new Blob([data.githubYaml], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = 'repairx-auto-heal.yml';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-blue-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white uppercase">
                CI/CD & GitHub Actions Self-Healing Integration
              </h2>
              <p className="text-xs text-slate-400">
                Plug REPAIRX directly into GitHub Actions or git pre-commit hooks to auto-heal failed PRs.
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

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-[#060912]">
          <button
            onClick={() => setTab('github')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'github'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>.github/workflows/repairx-auto-heal.yml</span>
          </button>
          <button
            onClick={() => setTab('precommit')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'precommit'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>.git/hooks/pre-commit</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs bg-[#050811]/95">
          {tab === 'github' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-sans text-xs">
                  Trigger autonomous repair on pull request test failures and push patches to branch.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyYaml}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-sans"
                  >
                    {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedYaml ? 'Copied!' : 'Copy YAML'}</span>
                  </button>
                  <button
                    onClick={handleDownloadYaml}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all font-sans"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .yml</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-blue-300 overflow-x-auto leading-relaxed">
                {data.githubYaml}
              </pre>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-sans text-xs">
                  Runs REPAIRX CLI before git commit to prevent broken endpoints from being committed.
                </span>
                <button
                  onClick={handleCopyHook}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-sans"
                >
                  {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHook ? 'Copied!' : 'Copy Hook Script'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 overflow-x-auto leading-relaxed">
                {data.preCommitScript}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
