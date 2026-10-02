import React, { useState } from 'react';
import { Play, Sparkles, ChevronDown, ChevronUp, Code2, Globe, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';

const PRESETS = [
  {
    label: 'GET /users/101 (Param Mismatch Bug)',
    method: 'GET',
    url: 'http://localhost:5000/target-api/api/v1/users/101',
    headers: {},
    body: '',
    desc: 'Triggers 500 CastError due to req.params.userID'
  },
  {
    label: 'GET /users/103/profile (Null Dereference Bug)',
    method: 'GET',
    url: 'http://localhost:5000/target-api/api/v1/users/103/profile',
    headers: {},
    body: '',
    desc: 'Triggers 500 TypeError on user.address.zipCode'
  },
  {
    label: 'GET /admin/audit (JWT Auth Crash)',
    method: 'GET',
    url: 'http://localhost:5000/target-api/api/v1/admin/audit',
    headers: { 'Authorization': 'Bearer malformed.jwt.token' },
    body: '',
    desc: 'Triggers 500 JsonWebTokenError unhandled error'
  },
  {
    label: 'POST /orders (Payload NaN Coercion Bug)',
    method: 'POST',
    url: 'http://localhost:5000/target-api/api/v1/orders',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: '101', item: 'Autonomous Agent Cluster', amount: '499.00' }, null, 2),
    desc: 'Triggers 500 ValidationError on string amount'
  },
  {
    label: 'POST /inventory/reserve (Empty Array Out-of-Bounds)',
    method: 'POST',
    url: 'http://localhost:5000/target-api/api/v1/inventory/reserve',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sku: 'SKU-002' }, null, 2),
    desc: 'Triggers 500 ReferenceError on empty stock indexing'
  },
  {
    label: 'POST /payment/checkout (Missing Env Secret)',
    method: 'POST',
    url: 'http://localhost:5000/target-api/api/v1/payment/checkout',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100, currency: 'USD' }, null, 2),
    desc: 'Triggers 500 Configuration Error on missing key'
  }
];

export default function ApiProbeBar({ onRunRepair, onProbeOnly, isRunning, isProbing }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:5000/target-api/api/v1/users/101');
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getMethodColor = (m) => {
    switch (m) {
      case 'GET': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'POST': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'PATCH': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const handleSelectPreset = (preset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setHeadersText(JSON.stringify(preset.headers || {}, null, 2));
    setBodyText(preset.body || '');
  };

  const parseJsonSafe = (str) => {
    try {
      return str.trim() ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  };

  const handleTriggerHeal = () => {
    const headers = parseJsonSafe(headersText) || {};
    const body = parseJsonSafe(bodyText);
    onRunRepair({ method, url, headers, body });
  };

  const handleTriggerProbe = () => {
    const headers = parseJsonSafe(headersText) || {};
    const body = parseJsonSafe(bodyText);
    onProbeOnly({ method, url, headers, body });
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl transition-all">
      {/* Top Header Label */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Target API Probe & Autonomous Ingestion Bar
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Enter any broken REST endpoint or select a chaos scenario below:
        </span>
      </div>

      {/* Main Interactive Command Input Bar */}
      <div className="flex flex-col lg:flex-row items-stretch gap-2.5 mb-3">
        {/* Method Select */}
        <div className="relative min-w-[110px]">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`w-full h-12 px-3.5 py-2 font-mono font-bold text-sm rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all ${getMethodColor(method)}`}
          >
            <option value="GET" className="bg-slate-900 text-blue-400">GET</option>
            <option value="POST" className="bg-slate-900 text-emerald-400">POST</option>
            <option value="PUT" className="bg-slate-900 text-amber-400">PUT</option>
            <option value="PATCH" className="bg-slate-900 text-purple-400">PATCH</option>
            <option value="DELETE" className="bg-slate-900 text-red-400">DELETE</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-4 pointer-events-none text-slate-400" />
        </div>

        {/* URL Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:5000/target-api/api/v1/users/101"
            className="w-full h-12 px-4 font-mono text-sm rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerProbe}
            disabled={isProbing || isRunning}
            className="h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            title="Inspect status code and response payload"
          >
            <Play className={`w-3.5 h-3.5 text-cyan-400 ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Probing...' : 'Probe Only'}</span>
          </button>

          <button
            onClick={handleTriggerHeal}
            disabled={isRunning || isProbing}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            title="Launch Autonomous 5-Agent Self-Healing Loop"
          >
            <Sparkles className={`w-4 h-4 text-cyan-200 ${isRunning ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{isRunning ? 'Investigating & Healing...' : 'Auto-Heal API'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick-Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 pb-2">
        <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
          <CornerDownRight className="w-3 h-3 text-cyan-400" /> Presets:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-[11px] font-mono text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center gap-1"
            title={p.desc}
          >
            <span className={`font-bold text-[10px] ${p.method === 'GET' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {p.method}
            </span>
            <span className="truncate max-w-[180px]">{p.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Toggle Advanced Config Accordion */}
      <div className="pt-2 border-t border-slate-800/60 mt-1">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showAdvanced ? 'Hide Request Headers & Payload' : 'Configure Custom Headers & JSON Payload (Auth/Body)'}</span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/40 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Request Headers (JSON)
              </label>
              <textarea
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                rows={3}
                className="w-full p-2.5 font-mono text-xs rounded-lg glass-input text-slate-200 focus:ring-1 focus:ring-cyan-500"
                placeholder='{\n  "Authorization": "Bearer token"\n}'
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Request Body (JSON)
              </label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={3}
                className="w-full p-2.5 font-mono text-xs rounded-lg glass-input text-slate-200 focus:ring-1 focus:ring-cyan-500"
                placeholder='{\n  "userId": "101"\n}'
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
