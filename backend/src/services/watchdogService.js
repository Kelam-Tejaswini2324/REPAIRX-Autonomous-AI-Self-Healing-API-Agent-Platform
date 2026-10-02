// Autonomous Watchdog Sentinel: Continuous Background Health Monitor & Auto-Healer
import axios from 'axios';
import { coordinator } from '../agents/multiAgentCoordinator.js';

export class WatchdogService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.pollIntervalMs = 5000;
    this.endpointsToWatch = [
      { method: 'GET', url: '/api/v1/health', expectedStatus: 200, name: 'Health Endpoint' },
      { method: 'GET', url: '/api/v1/users/101', expectedStatus: 200, name: 'User Profile Fetch' },
      { method: 'GET', url: '/api/v1/users/103/profile', expectedStatus: 200, name: 'Nested Profile Address' },
      { method: 'POST', url: '/api/v1/orders', expectedStatus: 201, name: 'Order Processing', body: { userId: '101', item: 'Auto-Compute', amount: '199.99' } }
    ];
    this.onAlert = null;
    this.stats = {
      totalChecks: 0,
      failuresDetected: 0,
      autoRepairsTriggered: 0,
      lastCheckTime: null
    };
  }

  setAlertCallback(callback) {
    this.onAlert = callback;
  }

  start(baseUrl = 'http://127.0.0.1:5000/target-api') {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this._runHealthCheck(baseUrl);
    }, this.pollIntervalMs);

    if (this.onAlert) {
      this.onAlert({
        type: 'watchdog_status',
        status: 'RUNNING',
        message: `🛡️ Autonomous Watchdog Sentinel ACTIVE: Polling microservice endpoints every ${this.pollIntervalMs / 1000}s`
      });
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    if (this.onAlert) {
      this.onAlert({
        type: 'watchdog_status',
        status: 'STOPPED',
        message: '⏸️ Watchdog Sentinel paused.'
      });
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      pollIntervalMs: this.pollIntervalMs,
      stats: this.stats,
      watchedEndpoints: this.endpointsToWatch
    };
  }

  async _runHealthCheck(baseUrl) {
    for (const ep of this.endpointsToWatch) {
      this.stats.totalChecks += 1;
      this.stats.lastCheckTime = new Date().toISOString();

      const fullUrl = baseUrl + ep.url;
      try {
        const res = await axios({
          url: fullUrl,
          method: ep.method,
          data: ep.body,
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
          timeout: 3000
        });

        const isOk = res.status === ep.expectedStatus || (res.status >= 200 && res.status < 300);

        if (!isOk) {
          this.stats.failuresDetected += 1;
          
          if (this.onAlert) {
            this.onAlert({
              type: 'watchdog_anomaly',
              endpoint: ep.name,
              method: ep.method,
              url: fullUrl,
              status: res.status,
              expectedStatus: ep.expectedStatus,
              message: `🚨 Watchdog Anomaly Detected: ${ep.method} ${ep.url} returned HTTP ${res.status} (Expected: ${ep.expectedStatus})`
            });
          }

          // Trigger Auto-Repair Loop if Watchdog is running
          this.stats.autoRepairsTriggered += 1;
          coordinator.runRepairPipeline({
            probeRequest: {
              url: fullUrl,
              method: ep.method,
              body: ep.body,
              expectedStatus: ep.expectedStatus
            }
          }, (event) => {
            if (this.onAlert) this.onAlert({ type: 'agent_event', ...event });
          }).catch(console.error);

          // Pause further loop checks until resolution
          break;
        }
      } catch (err) {
        // Network timeout / connection drop
        this.stats.failuresDetected += 1;
      }
    }
  }
}

export const watchdog = new WatchdogService();
