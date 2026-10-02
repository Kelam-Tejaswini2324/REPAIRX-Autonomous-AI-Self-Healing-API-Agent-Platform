import React, { useState } from 'react';
import { Send, Play, Globe, CheckCircle2, XCircle, Clock, ChevronDown, Sparkles } from 'lucide-react';

const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/health', label: 'Health Check', body: '' },
  { method: 'GET', path: '/api/v1/users', label: 'List All Users', body: '' },
  { method: 'GET', path: '/api/v1/users/101', label: 'Get User by ID', body: '' },
  { method: 'GET', path: '/api/v1/users/103/profile', label: 'Get User Profile (Address)', body: '' },
  { method: 'POST', path: '/api/v1/orders', label: 'Create Order', body: JSON.stringify({ userId: '101', item: 'AI Diagnostic Compute', amount: 199.99 }, null, 2) },
  { method: 'POST', path: '/api/v1/inventory/reserve', label: 'Reserve Inventory', body: JSON.stringify({ sku: 'SKU-001' }, null, 2) },
  { method: 'POST', path: '/api/v1/payment/checkout', label: 'Process Payment', body: JSON.stringify({ amount: 100, currency: 'USD' }, null, 2) },
  { method: 'GET', path: '/api/v1/admin/audit', label: 'Admin Security Audit', body: '', headers: { Authorization: 'Bearer valid-repairx-token-2026' } }
];

export default function InteractiveSwaggerClient() {
  const [selectedEp, setSelectedEp] = useState(ENDPOINTS[2]);
  const [customPath, setCustomPath] = useState(ENDPOINTS[2].path);
  const [method, setMethod] = useState(ENDPOINTS[2].method);
  const [body, setBody] = useState(ENDPOINTS[2].body);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSelect = (ep) => {
    setSelectedEp(ep);
    setCustomPath(ep.path);
    setMethod(ep.method);
    setBody(ep.body);
  };

  const handleSend = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const url = `http://localhost:5000/target-api${customPath.startsWith('/') ? customPath : '/' + customPath}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(selectedEp.headers || {})
        },
        body: method !== 'GET' && body ? body : undefined
      });

      const latency = Date.now() - start;
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { text: await res.text() };
      }

      setResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Error'),
        latency,
        data
      });
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Connection Failed',
        latency: Date.now() - start,
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 border border-slate-800/80 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Live API Playground (Target Microservice)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Mounted at: /target-api/api/v1/*
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {ENDPOINTS.map((ep, i) => (
          <button
            key={i}
            onClick={() => handleSelect(ep)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 ${
              selectedEp.path === ep.path && selectedEp.method === ep.method
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <span className={ep.method === 'GET' ? 'text-blue-400' : 'text-emerald-400'}>{ep.method}</span>
            <span className="truncate max-w-[140px]">{ep.path.replace('/api/v1', '')}</span>
          </button>
        ))}
      </div>

      {/* Request Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
        <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-cyan-400 flex items-center justify-center">
          {method}
        </div>
        <input
          type="text"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          className="flex-1 px-4 py-2 text-xs font-mono rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Sending...' : 'Send Request'}</span>
        </button>
      </div>

      {/* Response Box */}
      {response && (
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#050811] font-mono text-xs">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-bold ${response.status >= 200 && response.status < 300 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                HTTP {response.status} {response.statusText}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {response.latency}ms
              </span>
            </div>
            <span className="text-slate-500">Live Target Response</span>
          </div>

          <pre className="p-4 text-emerald-400 text-xs overflow-x-auto leading-relaxed max-h-[220px]">
            {JSON.stringify(response.data || response.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
