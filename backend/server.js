const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const sequelize = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const instructorAnalyticsRoutes = require('./routes/instructorAnalyticsRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CodeMentor+ Pro API is running!',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/instructor-analytics', instructorAnalyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  
// Test database connection and sync tables
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});

module.exports = app;