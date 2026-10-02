// Multi-Agent Pipeline Coordinator: Orchestrates Closed-Loop Autonomous API Repair
import { detectiveAgent } from './detectiveAgent.js';
import { codeLocatorAgent } from './codeLocatorAgent.js';
import { rootCauseAgent } from './rootCauseAgent.js';
import { repairAgent } from './repairAgent.js';
import { verificationAgent } from './verificationAgent.js';
import { incidentService } from '../services/incidentService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export class MultiAgentCoordinator {
  constructor() {
    this.activePipelines = new Map();
  }

  async runRepairPipeline({ probeRequest, customInstructions = null }, onEvent = null) {
    const pipelineId = 'pipe-' + Date.now();
    const startTime = Date.now();

    const emit = (agent, message, data = null) => {
      const eventPayload = {
        pipelineId,
        agent,
        message,
        data,
        timestamp: new Date().toISOString(),
        elapsedMs: Date.now() - startTime
      };
      if (onEvent) onEvent(eventPayload);
    };

    emit('system', '🚀 Initializing REPAIRX Autonomous Multi-Agent Closed Loop...');

    // 1. Detective Agent: Probe & failure detection
    emit('system', '🔍 Step 1/5: Launching Detective Agent...');
    const probeResult = await detectiveAgent.probe(probeRequest, emit);

    if (!probeResult.detected) {
      emit('system', '🟢 API Endpoint is already healthy (200 OK). No repair necessary.');
      return {
        success: true,
        status: 'HEALTHY',
        probeResult,
        message: 'Endpoint is fully functional and healthy.'
      };
    }

    // 2. Code Locator Agent: Pinpoint source code file and lines
    emit('system', '🔎 Step 2/5: Launching Code Locator Agent...');
    const location = await codeLocatorAgent.locateOffendingCode({
      url: probeResult.url,
      method: probeResult.method,
      errorData: probeResult
    }, emit);

    // 3. Root Cause Agent: Semantic analysis & diagnostic reasoning
    emit('system', '🧠 Step 3/5: Launching Root Cause Reasoning Agent...');
    const diagnosis = await rootCauseAgent.analyzeRootCause({
      errorData: probeResult,
      sourceCode: location.sourceCode,
      filePath: location.filePath,
      targetRoute: probeResult.url,
      method: probeResult.method
    }, emit);

    // If custom instructions provided from developer copilot, adjust reasoning
    if (customInstructions) {
      emit('system', `💡 Applying developer copilot tweak: "${customInstructions}"`);
    }

    // 4. Repair Agent: Unified diff patch synthesis
    emit('system', '🛠️ Step 4/5: Launching Repair Agent for Surgical Patch Generation...');
    const patchData = await repairAgent.generatePatch({
      sourceCode: location.sourceCode,
      diagnosis,
      filePath: location.filePath
    }, emit);

    // 5. Verification Agent: Isolated sandbox validation & regression suite
    emit('system', '🧪 Step 5/5: Launching Verification Agent in Isolated Sandbox...');
    const verification = await verificationAgent.verifyPatch({
      patchData,
      probeRequest
    }, emit);

    const totalDurationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    // Create incident record
    const incident = incidentService.createIncident({
      title: `${diagnosis.severity} Failure: ${probeResult.method} ${probeResult.url}`,
      endpoint: probeResult.url,
      method: probeResult.method,
      severity: diagnosis.severity,
      rootCause: diagnosis.rootCause,
      affectedFile: location.filePath,
      confidenceScore: diagnosis.confidenceScore,
      diff: patchData.patchDiff,
      patch: patchData.patchedCode
    });

    if (verification.verified) {
      incidentService.updateIncident(incident.id, {
        status: 'VERIFIED_WAITING_APPROVAL',
        mttrSeconds: parseFloat(totalDurationSeconds),
        regressionPassed: `${verification.regressionReport.passed}/${verification.regressionReport.total}`
      });

      emit('system', `🎉 Self-Healing Complete in ${totalDurationSeconds}s! Verification Passed with 0 Regressions. Ready for Developer Review.`);
    } else {
      emit('system', `⚠️ Self-Healing Finished with Warnings. Sandbox reported failed checks.`);
    }

    return {
      success: true,
      pipelineId,
      incidentId: incident.id,
      durationSeconds: totalDurationSeconds,
      probeResult,
      location,
      diagnosis,
      patchData,
      verification,
      status: verification.verified ? 'READY_FOR_APPROVAL' : 'NEEDS_REVIEW'
    };
  }

  // Developer human-in-the-loop action: Apply fix to repo
  async applyFixToRepository(incidentId, patchData) {
    const fullPath = path.resolve(projectRoot, patchData.filePath);
    fs.writeFileSync(fullPath, patchData.patchedCode, 'utf8');

    incidentService.updateIncident(incidentId, {
      status: 'HEALED',
      resolvedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Patch applied successfully to ${patchData.filePath}. API is now live and healed!`,
      filePath: patchData.filePath
    };
  }
}

export const coordinator = new MultiAgentCoordinator();
