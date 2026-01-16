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
      'http://127.0.0.1:3000'
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
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});
const safeRequire = (path) => {
  try {
    return require(path);
  } catch (err) {
    console.warn(`⚠️  Warning: Could not load route ${path}. Skipping...`);
    console.warn(`   Error: ${err.message}`);
    return express.Router();
  }
};
const authRoutes = safeRequire('./routes/auth');
const patientsRoutes = safeRequire('./routes/patients');
const doctorsRoutes = safeRequire('./routes/doctors');
const appointmentsRoutes = safeRequire('./routes/appointments');
const billingRoutes = safeRequire('./routes/billing');
const reportsRoutes = safeRequire('./routes/reports');
const usersRoutes = safeRequire('./routes/users');
const medicalRecordsRoutes = safeRequire('./routes/medical-records');
const uploadRoutes = safeRequire('./routes/upload');
const searchRoutes = safeRequire('./routes/search');
const profileRoutes = safeRequire('./routes/profile');
const API_PREFIX = '/api';
if (authRoutes) app.use(`${API_PREFIX}/auth`, authRoutes);
if (patientsRoutes) app.use(`${API_PREFIX}/patients`, patientsRoutes);
if (doctorsRoutes) app.use(`${API_PREFIX}/doctors`, doctorsRoutes);
if (appointmentsRoutes) app.use(`${API_PREFIX}/appointments`, appointmentsRoutes);
if (billingRoutes) app.use(`${API_PREFIX}/bills`, billingRoutes);
if (reportsRoutes) app.use(`${API_PREFIX}/reports`, reportsRoutes);
if (usersRoutes) app.use(`${API_PREFIX}/users`, usersRoutes);
if (medicalRecordsRoutes) app.use(`${API_PREFIX}/medical-records`, medicalRecordsRoutes);
if (uploadRoutes) app.use(`${API_PREFIX}/upload`, uploadRoutes);
if (searchRoutes) app.use(`${API_PREFIX}/search`, searchRoutes);
if (profileRoutes) app.use(`${API_PREFIX}/profile`, profileRoutes);
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
const PORT = process.env.PORT || 5000;
testConnection().then(connected => {
  if (!connected) {
    console.error('❌ WARNING: Database connection failed! The server will start, but API calls requiring DB will fail.');
    console.error('👉 ACTION: Make sure your MySQL service is RUNNING.');
  }
});
const server = app.listen(PORT, () => {
  console.log(`🚀 HMS Server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use! Please stop the other process or change the PORT in .env`);
    process.exit(1);
  }
});
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