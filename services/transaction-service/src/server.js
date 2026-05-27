const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const webhookController = require('./controllers/webhookController');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 1. WEBHOOK FIRST (Must be before any JSON/Body parsers)
app.post('/transactions/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

// 2. GLOBAL MIDDLEWARE
app.use(cors({ origin: ['http://localhost:5173', 'https://xxxxxx.cloudfront.net'] }));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// 3. OTHER ROUTES
app.post('/transactions/create-order', webhookController.createOrder);
app.use('/transactions', transactionRoutes);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Mount routes
app.use('/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Transaction Service is healthy' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`Transaction Service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
