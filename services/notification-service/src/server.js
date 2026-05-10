require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Routes
app.use('/audit', require('./routes/auditRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});

// Start Worker
require('./workers/notificationWorker');

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
