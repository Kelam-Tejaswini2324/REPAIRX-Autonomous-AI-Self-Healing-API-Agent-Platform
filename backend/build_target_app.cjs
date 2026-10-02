const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/DELL/.gemini/antigravity/scratch/repairx/backend/src';

// 1. Target App Model
const userModelCode = `// In-Memory Database Model for Target Application
export class UserModel {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [
      { id: '101', name: 'Tejaswini Sharma', email: 'tejaswini@repairx.dev', role: 'admin', address: { city: 'Bengaluru', zipCode: '560001' } },
      { id: '102', name: 'Anitha Rao', email: 'anitha@repairx.dev', role: 'engineer', address: { city: 'Hyderabad', zipCode: '500081' } },
      { id: '103', name: 'Marcus Vance', email: 'marcus@repairx.dev', role: 'analyst', address: null }, // Null address for Bug 2 testing
      { id: '104', name: 'Elena Rostova', email: 'elena@repairx.dev', role: 'lead', address: { city: 'San Francisco', zipCode: '94107' } }
    ];

    this.orders = [
      { orderId: 'ORD-901', userId: '101', item: 'Autonomous Agent Cluster', amount: 499.00, status: 'completed' },
      { orderId: 'ORD-902', userId: '102', item: 'Sandbox Telemetry Engine', amount: 149.50, status: 'pending' }
    ];

    this.inventory = [
      { sku: 'SKU-001', name: 'Dedicated Inference Node A100', stock: [{ batch: 'B1', count: 8 }] },
      { sku: 'SKU-002', name: 'Low-Latency Gateway Router', stock: [] } // Empty stock for Bug 5
    ];
  }

  async findAll() {
    return [...this.users];
  }

  async findById(id) {
    if (!id) return null;
    return this.users.find(u => u.id === String(id)) || null;
  }

  async createOrder(data) {
    const newOrder = {
      orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId: data.userId,
      item: data.item,
      amount: data.amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async getInventory(sku) {
    return this.inventory.find(i => i.sku === sku) || null;
  }
}

export const db = new UserModel();
`;

// 2. Target App Auth Middleware
const authMiddlewareCode = `// Authentication Middleware
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing Authorization header',
      code: 'AUTH_HEADER_MISSING'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Malformed Bearer token',
      code: 'AUTH_TOKEN_MALFORMED'
    });
  }

  const token = parts[1];

  // Bug 3 scenario will trigger unhandled exception if not caught properly
  if (token === 'expired-token') {
    return res.status(401).json({
      success: false,
      error: 'Token has expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (token === 'valid-repairx-token-2026' || token === 'admin-secret-jwt' || token === 'demo-token') {
    req.user = { id: '101', role: 'admin', name: 'Tejaswini Sharma' };
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Forbidden: Invalid token signature',
    code: 'INVALID_SIGNATURE'
  });
};
`;

// 3. Target App Controller
const userControllerCode = `// User & Service Controller for Target Application
import { db } from '../models/userModel.js';

// GET /api/v1/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.findAll();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/v1/users/:id
// BUG 1: Parameter mismatch (req.params.userID instead of req.params.id)
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const user = await db.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with id: ' + userId });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: ' + err.message,
      stack: err.stack
    });
  }
};

// GET /api/v1/users/:id/profile
// BUG 2: Unhandled null dereference (user.address.zipCode when address is null)
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const zipCode = user.address ? user.address.zipCode : 'N/A';
    const city = user.address ? user.address.city : 'Remote';

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: {
          city: city,
          zipCode: zipCode
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'TypeError: ' + err.message,
      stack: err.stack
    });
  }
};

// POST /api/v1/orders
// BUG 4: Schema type mismatch / NaN calculation on payload parsing
export const createOrder = async (req, res) => {
  try {
    const { userId, item, amount } = req.body;
    if (!userId || !item) {
      return res.status(400).json({ success: false, error: 'Missing required order fields (userId, item)' });
    }

    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount specified' });
    }

    const order = await db.createOrder({ userId, item, amount: parsedAmount });
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Order Processing Error: ' + err.message,
      stack: err.stack
    });
  }
};

// POST /api/v1/inventory/reserve
// BUG 5: Race condition / pop on empty array causing unhandled ReferenceError
export const reserveInventory = async (req, res) => {
  try {
    const { sku } = req.body;
    const item = await db.getInventory(sku);
    if (!item) {
      return res.status(404).json({ success: false, error: 'SKU not found: ' + sku });
    }

    if (!item.stock || item.stock.length === 0) {
      return res.status(409).json({ success: false, error: 'Inventory out of stock for SKU: ' + sku });
    }

    const allocatedBatch = item.stock[0];
    return res.status(200).json({
      success: true,
      message: 'Stock reserved successfully',
      batch: allocatedBatch.batch
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Inventory Allocation Error: ' + err.message,
      stack: err.stack
    });
  }
};

// POST /api/v1/payment/checkout
// BUG 6: Missing environment config / secret key dereference
export const processPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const gatewayKey = process.env.PAYMENT_GATEWAY_KEY || 'test_sk_repairx_fallback_key';
    
    if (!gatewayKey) {
      return res.status(500).json({ success: false, error: 'Configuration Error: Payment gateway key missing' });
    }

    return res.status(200).json({
      success: true,
      transactionId: 'TXN-' + Date.now(),
      amount: amount || 100,
      currency: currency || 'USD',
      status: 'settled',
      gateway: 'Stripe Sandbox v2'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Payment Gateway Error: ' + err.message,
      stack: err.stack
    });
  }
};
`;

// 4. Target App Routes
const userRoutesCode = `// Target Microservice Route Definitions
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  createOrder,
  reserveInventory,
  processPayment
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/health', (req, res) => res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() }));
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/profile', getUserProfile);

// Order & business routes
router.post('/orders', createOrder);
router.post('/inventory/reserve', reserveInventory);
router.post('/payment/checkout', processPayment);

// Protected route
router.get('/admin/audit', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    systemAudit: { activeNodes: 4, clusterHealth: '99.98%', securityPatches: 'Up to Date' }
  });
});

export default router;
`;

// 5. Target App Entrypoint
const targetAppCode = `// Standalone Express App Instance for Target Microservice
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

export const createTargetApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Mount routes at /api/v1
  app.use('/api/v1', userRoutes);
  
  // Catch 404
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found: ' + req.method + ' ' + req.url });
  });

  return app;
};
`;

// 6. Target App Test Suite
const testSuiteCode = `// Automated Verification & Regression Test Suite for Target Microservice
import { db } from '../models/userModel.js';
import { createTargetApp } from '../app.js';
import http from 'http';

// Light-weight in-memory test runner for rapid sandbox verification
export async function runRegressionTests(customApp = null) {
  const app = customApp || createTargetApp();
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = \`http://127.0.0.1:\${port}/api/v1\`;

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
        error: passed ? null : \`Expected \${test.expectedStatus} but got \${response.status}\`
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
`;

// Write all target app files
fs.writeFileSync(path.join(srcDir, 'target-app/models/userModel.js'), userModelCode);
fs.writeFileSync(path.join(srcDir, 'target-app/middleware/auth.js'), authMiddlewareCode);
fs.writeFileSync(path.join(srcDir, 'target-app/controllers/userController.js'), userControllerCode);
fs.writeFileSync(path.join(srcDir, 'target-app/routes/userRoutes.js'), userRoutesCode);
fs.writeFileSync(path.join(srcDir, 'target-app/app.js'), targetAppCode);
fs.writeFileSync(path.join(srcDir, 'target-app/tests/api.test.js'), testSuiteCode);

console.log('Target app files generated successfully!');
