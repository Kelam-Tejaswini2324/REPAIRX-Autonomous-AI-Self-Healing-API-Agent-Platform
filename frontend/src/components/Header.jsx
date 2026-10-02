import React, { useState } from 'react';
import { Shield, Zap, BarChart3, Settings, RefreshCw, Cpu, Activity, Radio, GitBranch, Terminal } from 'lucide-react';

export default function Header({ 
  onOpenChaos, 
  onOpenAnalytics, 
  onOpenConfig, 
  onOpenCiCd,
  onResetApp, 
  isResetting, 
  activeBug,
  agentStatus = 'IDLE',
  isWatchdogRunning = false,
  onToggleWatchdog
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0A0F1D]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
            <Zap className="w-5 h-5 fill-current text-white animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0A0F1D] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                REPAIR<span className="text-cyan-400 font-black">X</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-full">
                Autonomous AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Closed-Loop Self-Healing API Platform & Sandbox Engine
            </p>
          </div>
        </div>

        {/* Center Live System Telemetry Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Watchdog Sentinel Toggle Button */}
          <button
            onClick={onToggleWatchdog}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isWatchdogRunning
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Continuous Background Watchdog Poller"
          >
            <Radio className={`w-3.5 h-3.5 ${isWatchdogRunning ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
            <span>Watchdog Sentinel:</span>
            <span className={isWatchdogRunning ? 'text-cyan-300 font-bold' : 'text-slate-500 font-normal'}>
              {isWatchdogRunning ? 'ACTIVE (POLLING)' : 'OFF'}
            </span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${agentStatus === 'RUNNING' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span className="text-slate-400">Agent:</span>
            <span className="font-medium text-slate-200">
              {agentStatus === 'RUNNING' ? 'HEALING' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Sandbox:</span>
            <span className="font-medium text-emerald-400">ISOLATED</span>
          </div>

          {activeBug && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-300 animate-pulse">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold">CHAOS:</span>
              <span className="truncate max-w-[120px]">{activeBug.name}</span>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={onOpenChaos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600/20 to-amber-600/20 hover:from-red-600/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-sm transition-all duration-200"
            title="Open Chaos Studio (Break My API)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Break My API</span>
          </button>

          <button
            onClick={onOpenCiCd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Export CI/CD GitHub Action & Pre-Commit Hook"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">CI/CD Export</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Reliability & MTTR Analytics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={onResetApp}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Restore Target App to Clean State"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onOpenConfig}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-all"
            title="Configure AI & Settings"
          >
            <Settings className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

      </div>
    </header>
  );
}
