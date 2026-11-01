require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Global Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// Base Route & Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Keya Studio Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    db: 'connected'
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/studios', require('./src/routes/studioRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/wishlist', require('./src/routes/wishlistRoutes'));

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server with Database Connection
async function startServer() {
  try {
    // Attempt DB connection
    await connectDB();
  } catch (error) {
    console.warn('[Warning] MongoDB connection failed on boot. Check your MONGO_URI in .env.');
  }

  app.listen(PORT, () => {
    console.log(`[Keya Studio Server] Listening on port ${PORT}`);
    console.log(`[Keya Studio Server] Allowing requests from ${CLIENT_URL}`);
  });
}

startServer();

module.exports = app;
