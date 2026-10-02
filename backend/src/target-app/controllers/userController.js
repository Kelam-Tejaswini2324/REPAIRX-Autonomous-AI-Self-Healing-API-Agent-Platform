// User & Service Controller for Target Application
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
    // BROKEN: Accessing req.params.userID instead of req.params.id
    const userId = req.params.userID;
    if (!userId) {
      throw new Error("CastError: Cast to ObjectId failed for value undefined at path '_id'");
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
