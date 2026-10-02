// Target Microservice Route Definitions
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
