// 1. Detective Agent: Failure Detector & Telemetry Inspector
import axios from 'axios';

export class DetectiveAgent {
  constructor() {
    this.name = 'Detective Agent';
    this.role = 'Failure Detection & Telemetry Analysis';
  }

  async probe({ url, method = 'GET', headers = {}, body = null, expectedStatus = 200 }, emitEvent = null) {
    const log = (msg, data = null) => {
      if (emitEvent) emitEvent('detective', msg, data);
    };

    log(`[Detective Agent] Initiating health probe on: ${method} ${url}`);
    const startTime = Date.now();

    try {
      const response = await axios({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RepairX-Probe-Agent/2.0',
          ...headers
        },
        data: body,
        validateStatus: () => true // Do not throw on 4xx/5xx
      });

      const responseTimeMs = Date.now() - startTime;
      const isHealthy = response.status === expectedStatus || (response.status >= 200 && response.status < 300);

      log(`[Detective Agent] Probe responded in ${responseTimeMs}ms with HTTP status ${response.status}`, {
        status: response.status,
        headers: response.headers,
        responseTimeMs
      });

      if (!isHealthy) {
        log(`[Detective Agent] 🔴 API FAILURE DETECTED! Status: ${response.status} (Expected: ${expectedStatus})`);
        
        let stack = response.data?.stack || null;
        let errorMessage = response.data?.error || response.data?.message || 'HTTP ' + response.status;

        // If no explicit stack trace in JSON response, synthesize breadcrumb trace
        if (!stack) {
          stack = `Error: API returned HTTP ${response.status}\n    at RequestHandler (${url})\n    at Dispatcher (repairx/gateway/dispatcher.js:42:15)\n    at Layer.handle [as handle_request] (express/lib/router/layer.js:95:5)`;
        }

        return {
          detected: true,
          status: response.status,
          expectedStatus,
          responseTimeMs,
          error: errorMessage,
          stack,
          headers: response.headers,
          data: response.data,
          url,
          method
        };
      }

      log(`[Detective Agent] 🟢 API is healthy. Status: ${response.status}`);
      return {
        detected: false,
        status: response.status,
        expectedStatus,
        responseTimeMs,
        data: response.data,
        url,
        method
      };
    } catch (err) {
      const responseTimeMs = Date.now() - startTime;
      log(`[Detective Agent] 🔴 Network / Connection Failure: ${err.message}`);

      return {
        detected: true,
        status: 500,
        expectedStatus,
        responseTimeMs,
        error: err.message,
        stack: err.stack,
        url,
        method
      };
    }
  }
}

export const detectiveAgent = new DetectiveAgent();
