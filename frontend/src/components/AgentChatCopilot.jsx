import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare, CornerDownLeft } from 'lucide-react';

export default function AgentChatCopilot({ onSendInstruction, isRunning = false, pipelineData = null }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: "Hello Developer! I'm your REPAIRX Self-Healing Copilot. When an API breaks, I'll diagnose the root cause and generate a fix. You can instruct me to tweak or customize the patch at any time!"
    }
  ]);

  const handleSend = () => {
    if (!input.trim() || isRunning) return;
    const userMsg = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    // Trigger pipeline tweak
    onSendInstruction(userMsg);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Understood! Applying custom instruction: "${userMsg}" to the repair engine and validating patch in isolated sandbox...`
        }
      ]);
    }, 600);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-xl border border-slate-800/80 flex flex-col h-[340px]">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Developer AI Copilot & Tweak Studio
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Human-in-the-Loop Active
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-2.5 rounded-xl max-w-[88%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
              {m.sender === 'user' ? 'You (Developer)' : 'REPAIRX AI'}
            </span>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={pipelineData ? "e.g. 'Add input check for negative numbers' or 'Return 404'" : "Ask REPAIRX or instruct patch customizations..."}
          className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isRunning || !input.trim()}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white transition-all disabled:opacity-40"
          title="Send Instruction to Agent"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
