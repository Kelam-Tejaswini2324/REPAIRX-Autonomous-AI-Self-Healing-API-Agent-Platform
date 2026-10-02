# 🚀 REPAIRX — Autonomous AI Self-Healing API Agent Platform

> **Closed-Loop Autonomous AI Agent that Detects, Diagnoses, Patches, Sandboxes, Tests, and Repairs Broken APIs in Real Time.**

---

## 🌟 The Problem & The REPAIRX Innovation

When a production API fails with a `500 Internal Server Error`, developers typically waste 30–60 minutes checking Postman, reading logs, locating files, manually writing patches, restarting servers, and executing regression tests.

**REPAIRX** replaces this tedious manual loop with a **fully autonomous 5-Agent Self-Healing Pipeline**:

```
                  ┌──────────────────────┐
                  │   🚨 Broken API      │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 🔍 1. Detective Agent │  (Probe, Status 500, Logs & Stack Trace)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 🔎 2. Code Locator   │  (AST Syntax Tree & Line Pinpointing)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 🧠 3. Root Cause AI  │  (Gemini 2.5 / Semantic Reasoning & Confidence)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 🛠️ 4. Repair Agent    │  (Surgical Minimal Unified Diff Synthesis)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 🧪 5. Sandbox Engine │  (Isolated Runtime & 12/12 Regression Suite)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 👨‍💻 6. Human Review   │  (1-Click Deploy to Repository or PR Export)
                  └──────────────────────┘
```

---

## 💎 Key Features & Differentiators

1. **Interactive Global API Probe Bar**: Insert any live API URL (`GET`, `POST`, etc.), headers, query params, or JSON body for instant probe and self-healing.
2. **Safe Isolated Sandbox Matrix**: Source code is never corrupted during diagnosis. Patches are dynamically executed and verified in an isolated virtual sandbox runtime.
3. **"Break My API" Chaos Studio**: 6 pre-configured realistic production failure modes (Param Mismatch, Null Pointer Dereference, JWT Signature Crash, Payload Schema Coercion, Race Condition Bounds, Missing Env Secret).
4. **Human-in-the-Loop Mission Control**: Interactive Side-by-Side Unified Code Diff Viewer with confidence scoring, blast radius analysis, one-click deploy to repo, and patch export.
5. **Real-time Live Agent Stream**: Terminal streaming real-time thoughts, AST inspections, and test outputs via Server-Sent Events (SSE).
6. **Executive MTTR Analytics & Post-Mortem Generator**: Track Mean Time to Repair reduction (45m -> 6.4s), four-nines SLA uptime, and generate one-click Incident Post-Mortems in Markdown.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Glassmorphic UI
- **Backend**: Node.js, Express, Server-Sent Events (SSE), Diff Engine, Isolated Sandbox Runner
- **AI Reasoning**: Google Gemini API + Deterministic AST Semantic Heuristic Fallback Engine
- **Testing**: In-Memory Supertest Regression Harness (12 automated tests)

---

## 🚀 Quickstart Guide

### 1. Install & Start Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` with target microservice at `http://localhost:5000/target-api`.*

### 2. Install & Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*
