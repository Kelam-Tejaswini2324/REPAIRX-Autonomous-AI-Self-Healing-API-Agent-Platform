// REPAIRX Master Server: Autonomous API Repair Platform
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTargetApp } from './target-app/app.js';
import { ChaosEngine } from './chaos/chaosEngine.js';
import { coordinator } from './agents/multiAgentCoordinator.js';
import { incidentService } from './services/incidentService.js';
import { gemini } from './services/geminiService.js';
import { watchdog } from './services/watchdogService.js';
import { astGraph } from './services/astDependencyService.js';
import { cicdService } from './services/cicdTemplateService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Configure Watchdog alerts to broadcast over SSE
watchdog.setAlertCallback((alertData) => {
  broadcastSSE(alertData);
});

// Track active Server-Sent Events (SSE) subscriber clients
const sseClients = new Set();

const broadcastSSE = (eventData) => {
  const formatted = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(formatted);
    } catch (e) {
      sseClients.delete(client);
    }
  }
};

// 1. Mount Live Target Application Microservice at /target-api
const targetApp = createTargetApp();
app.use('/target-api', targetApp);

// 2. SSE Real-Time Live Agent Thought Stream
app.get('/api/repair/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to REPAIRX Live Agent Stream' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 3. Quick Probe Endpoint
app.post('/api/repair/probe', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body = null, expectedStatus = 200 } = req.body;
    
    // Auto-resolve relative paths to target API if localhost
    let probeUrl = url;
    if (!probeUrl.startsWith('http')) {
      probeUrl = `http://127.0.0.1:${PORT}/target-api` + (probeUrl.startsWith('/') ? probeUrl : '/' + probeUrl);
    }

    const { detectiveAgent } = await import('./agents/detectiveAgent.js');
    const result = await detectiveAgent.probe({
      url: probeUrl,
      method,
      headers,
      body,
      expectedStatus
    }, (agent, msg, data) => broadcastSSE({ agent, message: msg, data, timestamp: new Date().toISOString() }));

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Run Full Autonomous Multi-Agent Repair Loop
app.post('/api/repair/run', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body = null, expectedStatus = 200, customInstructions = null } = req.body;

    let probeUrl = url;
    if (!probeUrl.startsWith('http')) {
      probeUrl = `http://127.0.0.1:${PORT}/target-api` + (probeUrl.startsWith('/') ? probeUrl : '/' + probeUrl);
    }

    broadcastSSE({
      agent: 'system',
      message: `⚡ Initiating Autonomous Repair Task for ${method} ${probeUrl}...`,
      timestamp: new Date().toISOString()
    });

    const pipelineResult = await coordinator.runRepairPipeline({
      probeRequest: {
        url: probeUrl,
        path: probeUrl,
        method,
        headers,
        body,
        expectedStatus
      },
      customInstructions
    }, (eventPayload) => {
      broadcastSSE(eventPayload);
    });

    return res.status(200).json(pipelineResult);
  } catch (err) {
    broadcastSSE({ agent: 'system', message: `❌ Pipeline Error: ${err.message}`, error: true });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Developer Human-in-the-Loop: Apply Fix to Repository
app.post('/api/repair/apply', async (req, res) => {
  try {
    const { incidentId, patchData } = req.body;
    if (!patchData || !patchData.filePath) {
      return res.status(400).json({ success: false, error: 'Missing patchData or filePath' });
    }

    const result = await coordinator.applyFixToRepository(incidentId, patchData);
    
    // Save rollback snapshot
    incidentService.saveSnapshot({
      filePath: patchData.filePath,
      originalCode: patchData.originalCode,
      patchedCode: patchData.patchedCode,
      incidentId,
      title: `Fix for Incident ${incidentId}`
    });

    broadcastSSE({
      agent: 'system',
      message: `🚀 Patch deployed to live repository! File: ${patchData.filePath}. Target API is now online and healthy. Snapshot saved.`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Snapshots & Rollback Endpoints
app.get('/api/repair/snapshots', (req, res) => {
  const snapshots = incidentService.getSnapshots();
  return res.status(200).json({ success: true, data: snapshots });
});

app.post('/api/repair/rollback', async (req, res) => {
  try {
    const { snapshotId } = req.body;
    const snapshot = incidentService.getSnapshot(snapshotId);
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }

    const { fileURLToPath } = await import('url');
    const { default: path } = await import('path');
    const { default: fs } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fullPath = path.resolve(__dirname, '../', snapshot.filePath);

    fs.writeFileSync(fullPath, snapshot.originalCode, 'utf8');

    broadcastSSE({
      agent: 'system',
      message: `⏪ Rollback successful! Restored ${snapshot.filePath} to snapshot ${snapshotId}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Rolled back ${snapshot.filePath} to original pre-patch state.`,
      snapshot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// OpenAPI Spec & Contract Schema Endpoint
app.get('/api/schema/openapi', (req, res) => {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Target User & Microservice API',
      version: '1.0.0',
      description: 'Microservice endpoints monitored and self-healed by REPAIRX'
    },
    paths: {
      '/api/v1/users/{id}': {
        get: {
          summary: 'Get user by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'User profile retrieved successfully' },
            '404': { description: 'User not found' },
            '500': { description: 'Internal server error (Repaired by REPAIRX)' }
          }
        }
      },
      '/api/v1/users/{id}/profile': {
        get: {
          summary: 'Get formatted profile with address',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Profile returned with safe address fallback' }
          }
        }
      },
      '/api/v1/orders': {
        post: {
          summary: 'Create purchase order',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, item: { type: 'string' }, amount: { type: 'number' } } } } }
          },
          responses: { '201': { description: 'Order created' } }
        }
      }
    }
  };
  return res.status(200).json({ success: true, data: spec });
});

// 6. Developer Human-in-the-Loop: Reject / Feedback
app.post('/api/repair/reject', async (req, res) => {
  try {
    const { incidentId, reason } = req.body;
    incidentService.updateIncident(incidentId, { status: 'REJECTED_BY_DEV', rejectionReason: reason });
    
    broadcastSSE({
      agent: 'system',
      message: `🚫 Developer rejected patch: ${reason || 'No reason specified'}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Patch rejected.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Chaos Studio: Break My API Controls
app.get('/api/chaos/scenarios', (req, res) => {
  const scenarios = ChaosEngine.getScenarios();
  const activeBug = ChaosEngine.getActiveBug();
  return res.status(200).json({ success: true, scenarios, activeBug });
});

app.post('/api/chaos/inject', (req, res) => {
  try {
    const { bugId } = req.body;
    const result = ChaosEngine.injectBug(bugId);
    
    broadcastSSE({
      agent: 'chaos',
      message: `💥 Chaos Injected: ${result.activeBug.name} (${result.activeBug.endpoint})`,
      data: result.activeBug,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chaos/reset', (req, res) => {
  try {
    const result = ChaosEngine.resetAll();
    broadcastSSE({
      agent: 'chaos',
      message: `🛡️ Clean state restored. All chaos injected bugs reverted.`,
      timestamp: new Date().toISOString()
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Analytics & Metrics Dashboard
app.get('/api/analytics/metrics', (req, res) => {
  const metrics = incidentService.getMetrics();
  const incidents = incidentService.getIncidents();
  return res.status(200).json({ success: true, metrics, incidents });
});

// 9. Incidents & Post-Mortem Export
app.get('/api/incidents', (req, res) => {
  const incidents = incidentService.getIncidents();
  return res.status(200).json({ success: true, data: incidents });
});

app.get('/api/incidents/:id/postmortem', (req, res) => {
  const postMortem = incidentService.generatePostMortem(req.params.id);
  if (!postMortem) {
    return res.status(404).json({ success: false, error: 'Incident not found' });
  }
  return res.status(200).json({ success: true, data: postMortem });
});

// 10. Gemini API Key Configuration
app.post('/api/config/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey) {
    gemini.setApiKey(apiKey);
    return res.status(200).json({ success: true, message: 'Gemini API key configured successfully.' });
  }
  return res.status(400).json({ success: false, error: 'API key is required' });
});

// 11. Autonomous Watchdog Sentinel Endpoints
app.get('/api/watchdog/status', (req, res) => {
  return res.status(200).json({ success: true, data: watchdog.getStatus() });
});

app.post('/api/watchdog/start', (req, res) => {
  watchdog.start();
  return res.status(200).json({ success: true, message: 'Watchdog Sentinel started.' });
});

app.post('/api/watchdog/stop', (req, res) => {
  watchdog.stop();
  return res.status(200).json({ success: true, message: 'Watchdog Sentinel stopped.' });
});

// 12. AST Dependency Graph & Blast Radius
app.get('/api/ast/graph', (req, res) => {
  const activeFile = req.query.file || 'src/target-app/controllers/userController.js';
  const graph = astGraph.getDependencyGraph(activeFile);
  return res.status(200).json({ success: true, data: graph });
});

// 13. CI/CD GitHub Action & Pre-Commit Hook Export
app.get('/api/cicd/templates', (req, res) => {
  return res.status(200).json({
    success: true,
    githubYaml: cicdService.getGithubWorkflowYaml(),
    preCommitScript: cicdService.getPreCommitHookScript()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 REPAIRX Backend Server running on port ${PORT}`);
  console.log(`🎯 Target Microservice mounted at: http://localhost:${PORT}/target-api`);
  console.log(`⚡ Autonomous AI Multi-Agent Coordinator: ONLINE`);
  console.log(`====================================================`);
});
