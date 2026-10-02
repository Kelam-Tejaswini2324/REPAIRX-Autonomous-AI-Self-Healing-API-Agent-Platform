// In-Memory Database Model for Target Application
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
