require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'https://xxxxxx.cloudfront.net'] }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ai-scoring-service' });
});

// Connect to MongoDB
connectDB().then(() => {
  // Start SQS Worker
  require('./workers/scoringWorker');
  
  app.listen(PORT, () => {
    console.log(`AI Scoring Service running on port ${PORT}`);
  });
});

// Trigger deploy
