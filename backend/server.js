const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Debug environment variables
console.log('🔧 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'MkulimaConnect API is running successfully!',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Database connection - UPDATED without deprecated options
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      return;
    }

    console.log('🔗 Connecting to MongoDB...');
    
    // Updated connection without deprecated options
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};

// Initialize database connection
connectDB();

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('🎯 MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

// Import and use routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/farmers', require('./routes/farmers'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/weather', require('./routes/weather'));
  app.use('/api/contact', require('./routes/contact'));
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to MkulimaConnect API 🚀',
    version: '1.0.0',
    status: 'operational',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      '/api/health - Health check',
      '/api/auth - Authentication',
      '/api/farmers - Farmers management', 
      '/api/products - Products marketplace',
      '/api/orders - Order management',
      '/api/weather - Weather data & advisory',
      '/api/contact - Contact form'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎉 =================================');
  console.log('🚀 MkulimaConnect Backend Started!');
  console.log('=================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
  console.log(`🔗 Local: http://localhost:${PORT}/api`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
  console.log('=================================\n');
});