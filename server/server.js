const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Fallback Store matching MySQL database
let mockStore = {
  products: [],
  artisans: [],
  orders: [],
  b2bRequirements: [],
  b2bProposals: [],
  notifications: []
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'KalaConnect AI REST Backend',
    sihStatement: 'SIH26090 - Smart Cataloging for Marginalized Artisans',
    timestamp: new Date().toISOString()
  });
});

// Products Endpoints
app.get('/api/products', (req, res) => {
  const { category, state, search } = req.query;
  let results = [...mockStore.products];
  if (category) results = results.filter((p) => p.category === category);
  if (state) results = results.filter((p) => p.artisanLocation.includes(state));
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  res.json({ success: true, count: results.length, data: results });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockStore.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  mockStore.products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const idx = mockStore.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  mockStore.products[idx] = { ...mockStore.products[idx], ...req.body };
  res.json({ success: true, data: mockStore.products[idx] });
});

app.delete('/api/products/:id', (req, res) => {
  mockStore.products = mockStore.products.filter((p) => p.id !== req.params.id);
  res.json({ success: true, message: 'Product removed' });
});

// Artisans & Verification Endpoints
app.get('/api/artisans', (req, res) => {
  res.json({ success: true, data: mockStore.artisans });
});

app.put('/api/artisans/:id/verification', (req, res) => {
  const { status } = req.body;
  const artisan = mockStore.artisans.find((a) => a.id === req.params.id);
  if (!artisan) return res.status(404).json({ success: false, message: 'Artisan not found' });
  artisan.verificationStatus = status;
  artisan.verifiedAt = status === 'verified' ? new Date().toISOString() : null;
  res.json({ success: true, data: artisan });
});

// Orders Endpoints
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: mockStore.orders });
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  mockStore.orders.unshift(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

app.put('/api/orders/:id/status', (req, res) => {
  const order = mockStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, data: order });
});

// B2B Marketplace Endpoints
app.get('/api/b2b/requirements', (req, res) => {
  res.json({ success: true, data: mockStore.b2bRequirements });
});

app.post('/api/b2b/requirements', (req, res) => {
  const newReq = {
    id: `b2b-${Date.now()}`,
    ...req.body,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  mockStore.b2bRequirements.unshift(newReq);
  res.status(201).json({ success: true, data: newReq });
});

app.post('/api/b2b/proposals', (req, res) => {
  const newProposal = {
    id: `prop-${Date.now()}`,
    ...req.body,
    status: 'submitted',
    createdAt: new Date().toISOString()
  };
  mockStore.b2bProposals.unshift(newProposal);
  res.status(201).json({ success: true, data: newProposal });
});

// AI Catalog Generation API Endpoint
app.post('/api/ai/catalog-generator', (req, res) => {
  const { description } = req.body;
  // Echoes high-speed heuristic AI processing
  res.json({
    success: true,
    data: {
      generatedTitle: `Handcrafted Artisanal ${description ? description.slice(0, 30) : 'Heritage Creation'}`,
      category: 'Handicrafts',
      confidence: 0.96
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`KalaConnect AI Backend REST Service running on port ${PORT}`);
  });
}

module.exports = app;
