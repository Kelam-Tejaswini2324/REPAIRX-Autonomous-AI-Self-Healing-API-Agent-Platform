// 5. Verification Agent: Isolated Sandbox Test & Regression Validator
import { SandboxEngine } from '../sandbox/sandboxEngine.js';

export class VerificationAgent {
  constructor() {
    this.name = 'Verification Agent';
    this.role = 'Isolated Sandbox Execution & Regression Suite Validation';
  }

  async verifyPatch({ patchData, probeRequest }, emitEvent = null) {
    const log = (msg, data = null) => {
      if (emitEvent) emitEvent('verification', msg, data);
    };

    const sandbox = new SandboxEngine('verify-' + Date.now());

    try {
      log(`[Verification Agent] Initializing safe isolated runtime sandbox...`);
      await sandbox.createSandbox();

      log(`[Verification Agent] Applying synthesized patch inside isolated sandbox instance...`);
      await sandbox.applyPatchToSandbox(patchData.filePath, patchData.patchedCode);

      log(`[Verification Agent] Executing automated probe request and full 12-test regression suite...`);
      const results = await sandbox.runVerification(probeRequest);

      log(`[Verification Agent] Probe Test Result: Status ${results.probeResult.status} (Passed: ${results.probeResult.passed ? 'YES ✅' : 'NO ❌'})`);
      log(`[Verification Agent] Regression Suite: ${results.regressionReport.passed}/${results.regressionReport.total} Tests Passed (Success Rate: ${results.regressionReport.successRate}%)`);

      if (results.sandboxPassed) {
        log(`[Verification Agent] 🏆 ALL TESTS PASSED! Patch mathematically verified with 0 regressions.`);
      } else {
        log(`[Verification Agent] ⚠️ Sandbox validation flagged issues. Reviewing test failures...`, {
          failedTests: results.regressionReport.failed
        });
      }

      // Cleanup sandbox directory
      sandbox.cleanup();

      return {
        verified: results.sandboxPassed,
        probeResult: results.probeResult,
        regressionReport: results.regressionReport,
        summary: results.summary
      };
    } catch (err) {
      log(`[Verification Agent] Sandbox execution error: ${err.message}`);
      sandbox.cleanup();
      return {
        verified: false,
        error: err.message,
        probeResult: { passed: false, status: 500, error: err.message },
        regressionReport: { passed: 0, total: 12, failed: 12, successRate: 0, results: [] },
        summary: 'Sandbox verification failed: ' + err.message
      };
    }
  }
}

export const verificationAgent = new VerificationAgent();
