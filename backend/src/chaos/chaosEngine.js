// Chaos Studio - "Break My API" Bug Injector & State Manager
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCENARIOS = [
  {
    id: 'BUG_1_PARAM_MISMATCH',
    name: 'Route Parameter Mismatch (CastError)',
    category: 'Routing & Schema',
    severity: 'CRITICAL',
    endpoint: '/api/v1/users/101',
    method: 'GET',
    description: 'Controller attempts to access req.params.userID instead of req.params.id, causing null query and 500 internal server error.',
    impact: 'Users cannot retrieve account details; catastrophic cascade for profile view.',
    sampleRequest: { method: 'GET', path: '/api/v1/users/101' },
    expectedStatus: 200,
    brokenStatus: 500,
    brokenSnippet: `    // BROKEN: Accessing req.params.userID instead of req.params.id
    const userId = req.params.userID;
    if (!userId) {
      throw new Error("CastError: Cast to ObjectId failed for value undefined at path '_id'");
    }`,
    healthySnippet: `    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }`,
    file: 'src/target-app/controllers/userController.js'
  },
  {
    id: 'BUG_2_NULL_DEREFERENCE',
    name: 'Unhandled Null Dereference in Async Pipeline',
    category: 'Data Integrity',
    severity: 'HIGH',
    endpoint: '/api/v1/users/103/profile',
    method: 'GET',
    description: 'Controller directly reads user.address.zipCode without checking if address object is null, throwing unhandled TypeError: Cannot read properties of null.',
    impact: 'Crashes microservice endpoint for 25% of users with incomplete profile data.',
    sampleRequest: { method: 'GET', path: '/api/v1/users/103/profile' },
    expectedStatus: 200,
    brokenStatus: 500,
    brokenSnippet: `    // BROKEN: Direct access on null address
    const zipCode = user.address.zipCode;
    const city = user.address.city;`,
    healthySnippet: `    const zipCode = user.address ? user.address.zipCode : 'N/A';
    const city = user.address ? user.address.city : 'Remote';`,
    file: 'src/target-app/controllers/userController.js'
  },
  {
    id: 'BUG_3_AUTH_CRASH',
    name: 'Unhandled JWT Signature & Malformed Token Crash',
    category: 'Security & Auth',
    severity: 'CRITICAL',
    endpoint: '/api/v1/admin/audit',
    method: 'GET',
    headers: { 'Authorization': 'Bearer malformed.jwt.token' },
    description: 'Auth middleware throws unhandled JsonWebTokenError on invalid signature instead of returning a clean 403 Forbidden.',
    impact: 'Exposes raw server stack traces and crashes the auth gateway.',
    sampleRequest: { method: 'GET', path: '/api/v1/admin/audit', headers: { Authorization: 'Bearer malformed.jwt.token' } },
    expectedStatus: 403,
    brokenStatus: 500,
    brokenSnippet: `  // BROKEN: Uncaught token verification error
  if (!token.includes('.')) {
    throw new Error('JsonWebTokenError: invalid signature at JWT.verify');
  }`,
    healthySnippet: `  if (!token.includes('.')) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid token signature' });
  }`,
    file: 'src/target-app/middleware/auth.js'
  },
  {
    id: 'BUG_4_SCHEMA_COERCION',
    name: 'Strict Payload Schema Coercion & NaN Calculation',
    category: 'Business Logic',
    severity: 'HIGH',
    endpoint: '/api/v1/orders',
    method: 'POST',
    body: { userId: '101', item: 'Autonomous Agent Cluster', amount: '499.00' },
    description: 'Controller uses strict Number check without parseFloat or string validation, triggering NaN calculations and database validation failure.',
    impact: 'Checkout and billing flow blocked for all mobile & webhook clients passing string quantities.',
    sampleRequest: { method: 'POST', path: '/api/v1/orders', body: { userId: '101', item: 'Autonomous Agent Cluster', amount: '499.00' } },
    expectedStatus: 201,
    brokenStatus: 500,
    brokenSnippet: `    // BROKEN: NaN calculation on string amount
    if (typeof amount !== 'number') {
      throw new Error('ValidationError: amount must be a float number, received: ' + typeof amount);
    }`,
    healthySnippet: `    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount specified' });
    }`,
    file: 'src/target-app/controllers/userController.js'
  },
  {
    id: 'BUG_5_ARRAY_BOUNDS',
    name: 'Race Condition & Array Index Out of Bounds',
    category: 'Concurrency',
    severity: 'MEDIUM',
    endpoint: '/api/v1/inventory/reserve',
    method: 'POST',
    body: { sku: 'SKU-002' },
    description: 'Inventory allocation blindly indexes item.stock[0].batch when stock array is empty, causing unhandled ReferenceError.',
    impact: 'Inventory reservation crashes during flash sales when stock hits zero.',
    sampleRequest: { method: 'POST', path: '/api/v1/inventory/reserve', body: { sku: 'SKU-002' } },
    expectedStatus: 409,
    brokenStatus: 500,
    brokenSnippet: `    // BROKEN: Unchecked array indexing on empty stock
    const allocatedBatch = item.stock[0].batch;`,
    healthySnippet: `    if (!item.stock || item.stock.length === 0) {
      return res.status(409).json({ success: false, error: 'Inventory out of stock for SKU: ' + sku });
    }
    const allocatedBatch = item.stock[0].batch;`,
    file: 'src/target-app/controllers/userController.js'
  },
  {
    id: 'BUG_6_ENV_MISSING',
    name: 'Missing Environment Variable Fallback Crash',
    category: 'Infrastructure',
    severity: 'HIGH',
    endpoint: '/api/v1/payment/checkout',
    method: 'POST',
    body: { amount: 100, currency: 'USD' },
    description: 'Payment controller accesses process.env.PAYMENT_SECRET.length without fallback or existence check, causing fatal crash in preview environments.',
    impact: 'Payment processing fails completely in microservice clusters missing specific secrets.',
    sampleRequest: { method: 'POST', path: '/api/v1/payment/checkout', body: { amount: 100, currency: 'USD' } },
    expectedStatus: 200,
    brokenStatus: 500,
    brokenSnippet: `    // BROKEN: Unsafe environment variable access
    const keyLength = process.env.PAYMENT_GATEWAY_SECRET.length;`,
    healthySnippet: `    const gatewayKey = process.env.PAYMENT_GATEWAY_KEY || 'test_sk_repairx_fallback_key';
    if (!gatewayKey) {
      return res.status(500).json({ success: false, error: 'Configuration Error: Payment gateway key missing' });
    }`,
    file: 'src/target-app/controllers/userController.js'
  }
];

let activeBug = null;

export const ChaosEngine = {
  getScenarios: () => SCENARIOS,

  getActiveBug: () => activeBug,

  injectBug: (bugId) => {
    const scenario = SCENARIOS.find(s => s.id === bugId);
    if (!scenario) {
      throw new Error('Scenario not found: ' + bugId);
    }

    const targetFilePath = path.resolve(__dirname, '../../', scenario.file);
    let content = fs.readFileSync(targetFilePath, 'utf8');

    if (content.includes(scenario.healthySnippet)) {
      content = content.replace(scenario.healthySnippet, scenario.brokenSnippet);
      fs.writeFileSync(targetFilePath, content, 'utf8');
      activeBug = scenario;
      return { success: true, activeBug: scenario, message: `Injected ${scenario.name} successfully!` };
    } else if (content.includes(scenario.brokenSnippet)) {
      activeBug = scenario;
      return { success: true, activeBug: scenario, message: `Bug ${scenario.name} was already active.` };
    } else {
      activeBug = scenario;
      return { success: true, activeBug: scenario, message: `Activated scenario state ${scenario.id}` };
    }
  },

  resetAll: () => {
    for (const scenario of SCENARIOS) {
      const targetFilePath = path.resolve(__dirname, '../../', scenario.file);
      if (fs.existsSync(targetFilePath)) {
        let content = fs.readFileSync(targetFilePath, 'utf8');
        if (content.includes(scenario.brokenSnippet)) {
          content = content.replace(scenario.brokenSnippet, scenario.healthySnippet);
          fs.writeFileSync(targetFilePath, content, 'utf8');
        }
      }
    }
    const previous = activeBug;
    activeBug = null;
    return { success: true, message: 'All Chaos bugs restored to healthy production state.', previous };
  }
};
