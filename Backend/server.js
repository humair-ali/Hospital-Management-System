const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
});
app.disable('x-powered-by');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'https://hms-hospital-v2.vercel.app'
    ];
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS Request from origin:', origin);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`Incoming request: ${req.method} ${req.url}`);
  res.on('finish', () => {

    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});
const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');
const billingRoutes = require('./routes/billing');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
const medicalRecordsRoutes = require('./routes/medical-records');
const uploadRoutes = require('./routes/upload');
const searchRoutes = require('./routes/search');
const profileRoutes = require('./routes/profile');

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/patients`, patientsRoutes);
app.use(`${API_PREFIX}/doctors`, doctorsRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentsRoutes);
app.use(`${API_PREFIX}/bills`, billingRoutes);
app.use(`${API_PREFIX}/reports`, reportsRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/medical-records`, medicalRecordsRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);

app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management System (HMS) API',
    status: 'running',
    version: '1.0.1-DIAGNOSTIC-FIX-01',
    endpoints: {
      auth: '/auth/login, /auth/register',
      patients: '/patients',
      doctors: '/doctors',
      appointments: '/appointments',
      billing: '/bills',
      reports: '/reports'
    }
  });
});
app.use((err, req, res, next) => {
  console.error('SERVER ERROR 💥:', err);
  if (res.headersSent) return next(err);
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.message.includes('Database connection not established')) {
    return res.status(503).json({
      success: false,
      error: 'Database Connection Error: Please ensure MySQL is running.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    type: process.env.NODE_ENV === 'development' ? err.name : undefined
  });
});
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});
const { testConnection } = require('./config/db');
const PORT = parseInt(process.env.PORT || 5000, 10);


if (require.main === module) {
  (async () => {
    try {
      const connected = await testConnection();
      if (!connected) {
        console.warn('⚠️  Database connection warning - will attempt to proceed');
      } else {
        console.log('✅ Database connected successfully');
      }
    } catch (err) {
      console.warn('⚠️  Database connection error (non-critical):', err.message);
    }


    const startServer = (port) => {
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 HMS Server running on port ${port}`);
        console.log(`   Local: http://localhost:${port}`);
        console.log(`   Network: http://0.0.0.0:${port}`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`⚠️  Port ${port} is busy. Switching to ${port + 1}...`);
          startServer(port + 1);
        } else {
          console.error('Server error:', err);
        }
      });
      return server;
    };

    const server = startServer(PORT);

    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });
  })();
}

module.exports = app;
