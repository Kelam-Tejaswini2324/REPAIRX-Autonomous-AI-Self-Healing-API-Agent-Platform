// Automated Verification & Regression Test Suite for Target Microservice
import { db } from '../models/userModel.js';
import { createTargetApp } from '../app.js';
import http from 'http';

// Light-weight in-memory test runner for rapid sandbox verification
export async function runRegressionTests(customApp = null) {
  const app = customApp || createTargetApp();
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const tests = [
    {
      id: 'TEST_01',
      name: 'GET /api/v1/health returns 200 OK',
      method: 'GET',
      path: '/health',
      expectedStatus: 200
    },
    {
      id: 'TEST_02',
      name: 'GET /api/v1/users returns all users array',
      method: 'GET',
      path: '/users',
      expectedStatus: 200,
      validator: (data) => Array.isArray(data.data) && data.data.length >= 2
    },
    {
      id: 'TEST_03',
      name: 'GET /api/v1/users/101 retrieves valid user object',
      method: 'GET',
      path: '/users/101',
      expectedStatus: 200,
      validator: (data) => data.data && data.data.name === 'Tejaswini Sharma'
    },
    {
      id: 'TEST_04',
      name: 'GET /api/v1/users/102 retrieves valid user object',
      method: 'GET',
      path: '/users/102',
      expectedStatus: 200,
      validator: (data) => data.data && data.data.name === 'Anitha Rao'
    },
    {
      id: 'TEST_05',
      name: 'GET /api/v1/users/999 returns 404 Not Found',
      method: 'GET',
      path: '/users/999',
      expectedStatus: 404
    },
    {
      id: 'TEST_06',
      name: 'GET /api/v1/users/101/profile returns formatted address',
      method: 'GET',
      path: '/users/101/profile',
      expectedStatus: 200,
      validator: (data) => data.data && data.data.location.city === 'Bengaluru'
    },
    {
      id: 'TEST_07',
      name: 'GET /api/v1/users/103/profile handles null address safely',
      method: 'GET',
      path: '/users/103/profile',
      expectedStatus: 200,
      validator: (data) => data.data && data.data.location.zipCode === 'N/A'
    },
    {
      id: 'TEST_08',
      name: 'POST /api/v1/orders creates valid order with numeric string',
      method: 'POST',
      path: '/orders',
      body: { userId: '101', item: 'AI Diagnostic Compute', amount: '199.99' },
      expectedStatus: 201,
      validator: (data) => data.data && data.data.amount === 199.99
    },
    {
      id: 'TEST_09',
      name: 'POST /api/v1/inventory/reserve handles in-stock SKU-001',
      method: 'POST',
      path: '/inventory/reserve',
      body: { sku: 'SKU-001' },
      expectedStatus: 200
    },
    {
      id: 'TEST_10',
      name: 'POST /api/v1/inventory/reserve gracefully returns 409 for empty stock SKU-002',
      method: 'POST',
      path: '/inventory/reserve',
      body: { sku: 'SKU-002' },
      expectedStatus: 409
    },
    {
      id: 'TEST_11',
      name: 'POST /api/v1/payment/checkout successfully processes with fallback env',
      method: 'POST',
      path: '/payment/checkout',
      body: { amount: 250, currency: 'USD' },
      expectedStatus: 200,
      validator: (data) => data.status === 'settled'
    },
    {
      id: 'TEST_12',
      name: 'GET /api/v1/admin/audit rejects unauthenticated requests with 401',
      method: 'GET',
      path: '/admin/audit',
      expectedStatus: 401
    }
  ];

  const results = [];
  let passedCount = 0;

  for (const test of tests) {
    const startTime = Date.now();
    try {
      const response = await fetch(baseUrl + test.path, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: test.body ? JSON.stringify(test.body) : undefined
      });

      const responseTimeMs = Date.now() - startTime;
      let bodyData = {};
      try {
        bodyData = await response.json();
      } catch (e) {
        bodyData = { text: 'Non-JSON response' };
      }

      const statusMatches = response.status === test.expectedStatus;
      let validationPassed = true;
      if (statusMatches && test.validator) {
        try {
          validationPassed = test.validator(bodyData);
        } catch (e) {
          validationPassed = false;
        }
      }

      const passed = statusMatches && validationPassed;
      if (passed) passedCount++;

      results.push({
        id: test.id,
        name: test.name,
        method: test.method,
        path: test.path,
        expectedStatus: test.expectedStatus,
        actualStatus: response.status,
        passed,
        responseTimeMs,
        error: passed ? null : `Expected ${test.expectedStatus} but got ${response.status}`
      });
    } catch (err) {
      results.push({
        id: test.id,
        name: test.name,
        method: test.method,
        path: test.path,
        expectedStatus: test.expectedStatus,
        actualStatus: 0,
        passed: false,
        responseTimeMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  await new Promise((resolve) => server.close(resolve));

  return {
    total: tests.length,
    passed: passedCount,
    failed: tests.length - passedCount,
    successRate: Math.round((passedCount / tests.length) * 100),
    results
  };
}
