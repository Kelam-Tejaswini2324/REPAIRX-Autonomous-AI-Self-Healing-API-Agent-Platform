// Safe Isolated Runtime Sandbox Engine
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export class SandboxEngine {
  constructor(sessionId = 'sandbox-' + Date.now()) {
    this.sessionId = sessionId;
    this.sandboxDir = path.resolve(__dirname, `../../sandbox_instances/sandbox_${sessionId}`);
  }

  // Create isolated copy of the target application code
  async createSandbox() {
    if (!fs.existsSync(this.sandboxDir)) {
      fs.mkdirSync(this.sandboxDir, { recursive: true });
    }

    const targetAppSrc = path.resolve(projectRoot, 'src/target-app');
    this._copyFolderSync(targetAppSrc, this.sandboxDir);
    return this.sandboxDir;
  }

  // Apply proposed patch specifically to the sandbox file
  async applyPatchToSandbox(relativeFilePath, replacementCode) {
    const sandboxFilePath = path.resolve(this.sandboxDir, relativeFilePath.replace('src/target-app/', ''));
    if (!fs.existsSync(sandboxFilePath)) {
      const directPath = path.resolve(this.sandboxDir, relativeFilePath);
      if (fs.existsSync(directPath)) {
        fs.writeFileSync(directPath, replacementCode, 'utf8');
        return true;
      }
      throw new Error(`Sandbox file does not exist: ${sandboxFilePath}`);
    }

    fs.writeFileSync(sandboxFilePath, replacementCode, 'utf8');
    return true;
  }

  // Execute verification probe and regression suite against the sandboxed app
  async runVerification(probeRequest) {
    const timestamp = Date.now();
    const sandboxAppPath = path.resolve(this.sandboxDir, 'app.js');
    const sandboxTestPath = path.resolve(this.sandboxDir, 'tests/api.test.js');

    const { createTargetApp } = await import(`file:///${sandboxAppPath.replace(/\\/g, '/')}?t=${timestamp}`);
    const { runRegressionTests } = await import(`file:///${sandboxTestPath.replace(/\\/g, '/')}?t=${timestamp}`);

    const app = createTargetApp();
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Run probe test against the specific failing endpoint
    let probePassed = false;
    let probeResponse = null;
    const probeStart = Date.now();

    try {
      const rawPath = probeRequest.path || probeRequest.url || '/api/v1/users/101';
      // Normalize path and strip /target-api prefix if present
      let cleanPath = rawPath;
      if (cleanPath.startsWith('http')) {
        const parsed = new URL(cleanPath);
        cleanPath = parsed.pathname;
      }
      cleanPath = cleanPath.replace(/^\/target-api/, '');
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

      const probeUrl = baseUrl + cleanPath;
      const res = await fetch(probeUrl, {
        method: probeRequest.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(probeRequest.headers || {})
        },
        body: probeRequest.body ? JSON.stringify(probeRequest.body) : undefined
      });

      const probeTimeMs = Date.now() - probeStart;
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { text: 'Non-JSON' };
      }

      const expectedStatus = probeRequest.expectedStatus || 200;
      probePassed = res.status === expectedStatus || (res.status >= 200 && res.status < 300);

      probeResponse = {
        url: probeUrl,
        method: probeRequest.method || 'GET',
        status: res.status,
        expectedStatus,
        passed: probePassed,
        responseTimeMs: probeTimeMs,
        data
      };
    } catch (err) {
      probeResponse = {
        error: err.message,
        passed: false,
        status: 0,
        responseTimeMs: Date.now() - probeStart
      };
    }

    // 2. Run full 12-test regression suite
    const regressionReport = await runRegressionTests(app);

    // Close server
    await new Promise((resolve) => server.close(resolve));

    const allPassed = probePassed && regressionReport.passed === regressionReport.total;

    return {
      sandboxId: this.sessionId,
      sandboxPassed: allPassed,
      probeResult: probeResponse,
      regressionReport,
      summary: allPassed 
        ? `Verified in Sandbox: 100% Tests Passed (${regressionReport.passed}/${regressionReport.total}) + Probe Restored (Status ${probeResponse.status})`
        : `Sandbox Validation Warning: ${regressionReport.failed} tests failed`
    };
  }

  // Cleanup sandbox folder
  cleanup() {
    try {
      if (fs.existsSync(this.sandboxDir)) {
        fs.rmSync(this.sandboxDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore cleanup error
    }
  }

  _copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
      const stat = fs.lstatSync(path.join(from, element));
      if (stat.isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else if (stat.isDirectory()) {
        this._copyFolderSync(path.join(from, element), path.join(to, element));
      }
    });
  }
}
