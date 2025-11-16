const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Load inventory data
const loadInventory = () => {
  try {
    const dataPath = path.join(__dirname, 'data', 'inventory.json');
    const rawData = fs.readFileSync(dataPath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading inventory data:', error);
    return { items: [] };
  }
};

let inventory = loadInventory();

// Helper function to simulate processing delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Routes
// Health check endpoint
app.get('/health', async (req, res) => {
  await delay(100); // Simulate processing
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'inventory-backend',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Get all inventory items
app.get('/items', async (req, res) => {
  await delay(200); // Simulate database query
  
  const { category, limit = 10, offset = 0 } = req.query;
  let filteredItems = inventory.items;
  
  // Filter by category if provided
  if (category) {
    filteredItems = inventory.items.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  res.json({
    items: paginatedItems,
    total: filteredItems.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
    timestamp: new Date().toISOString()
  });
});

// Get item by ID
app.get('/items/:id', async (req, res) => {
  await delay(150); // Simulate database lookup
  
  const { id } = req.params;
  const item = inventory.items.find(item => item.id === parseInt(id));
  
  if (!item) {
    return res.status(404).json({
      error: 'Item not found',
      id: id,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    item: item,
    timestamp: new Date().toISOString()
  });
});

// Get inventory categories
app.get('/categories', async (req, res) => {
  await delay(100);
  
  const categories = [...new Set(inventory.items.map(item => item.category))];
  
  res.json({
    categories: categories,
    count: categories.length,
    timestamp: new Date().toISOString()
  });
});

// Create new item (for testing purposes)
app.post('/items', async (req, res) => {
  await delay(300); // Simulate database write
  
  const { name, category, price, stock, description } = req.body;
  
  if (!name || !category || !price) {
    return res.status(400).json({
      error: 'Missing required fields: name, category, price',
      timestamp: new Date().toISOString()
    });
  }
  
  const newItem = {
    id: inventory.items.length + 1,
    name,
    category,
    price: parseFloat(price),
    stock: parseInt(stock) || 0,
    description: description || '',
    created_at: new Date().toISOString()
  };
  
  inventory.items.push(newItem);
  
  res.status(201).json({
    message: 'Item created successfully',
    item: newItem,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Inventory Backend Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Items endpoint: http://localhost:${PORT}/items`);
  console.log(`🏷️  Categories: http://localhost:${PORT}/categories`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down inventory backend service...');
  process.exit(0);
});

module.exports = app;