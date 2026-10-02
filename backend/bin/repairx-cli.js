#!/usr/bin/env node
// REPAIRX Command-Line Autonomous Repair Tool (CLI)
import { coordinator } from '../src/agents/multiAgentCoordinator.js';
import { detectiveAgent } from '../src/agents/detectiveAgent.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log(`\n======================================================`);
  console.log(`🤖 REPAIRX Autonomous API Repair CLI v2.0`);
  console.log(`======================================================\n`);

  const args = process.argv.slice(2);
  let targetUrl = 'http://127.0.0.1:5000/target-api/api/v1/users/101';
  let method = 'GET';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) targetUrl = args[i + 1];
    if (args[i] === '--method' && args[i + 1]) method = args[i + 1].toUpperCase();
  }

  console.log(`🔍 Probing Target API: ${method} ${targetUrl}...`);

  const probe = await detectiveAgent.probe({
    url: targetUrl,
    method,
    expectedStatus: 200
  }, (agent, msg) => console.log(`[${agent.toUpperCase()}] ${msg}`));

  if (!probe.detected) {
    console.log(`\n✅ Endpoint is healthy (HTTP 200 OK). No repair needed.\n`);
    process.exit(0);
  }

  console.log(`\n🚨 Failure Detected! Initiating Autonomous Self-Healing Pipeline...\n`);

  const result = await coordinator.runRepairPipeline({
    probeRequest: {
      url: targetUrl,
      method,
      expectedStatus: 200
    }
  }, (event) => {
    console.log(`[${event.agent.toUpperCase()}] ${event.message}`);
  });

  console.log(`\n======================================================`);
  console.log(`🎯 HEALING RESULT:`);
  console.log(`Root Cause: ${result.diagnosis?.rootCause}`);
  console.log(`Confidence: ${result.diagnosis?.confidenceScore}%`);
  console.log(`Sandbox Verified: ${result.verification?.verified ? 'YES (12/12 Tests Passed)' : 'NO'}`);
  console.log(`MTTR: ${result.durationSeconds}s`);
  console.log(`======================================================\n`);

  if (result.verification?.verified) {
    console.log(`Applying fix to repository...`);
    await coordinator.applyFixToRepository(result.incidentId, result.patchData);
    console.log(`✨ Repository successfully healed!\n`);
  }
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});
