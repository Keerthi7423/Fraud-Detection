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
app.use(cors({ origin: ['http://localhost:5173', 'https://d49m8z8w0jzwy.cloudfront.net', 'http://d49m8z8w0jzwy.cloudfront.net', 'https://fraud-detection-theta-two.vercel.app'], credentials: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ai-scoring-service' });
});

// Internal webhook for local dev (replaces SQS)
app.post('/internal/score', async (req, res) => {
  try {
    const { scoreTransaction } = require('./services/aiScoringService');
    const Transaction = require('./models/Transaction');
    
    const body = req.body;
    console.log(`Processing local transaction: ${body.transactionId}`);
    
    const score = await scoreTransaction(body);

    let newStatus = 'clean';
    if (score.riskScore > 90) newStatus = 'fraudulent';
    else if (score.riskScore > 70) newStatus = 'suspicious';

    await Transaction.findOneAndUpdate(
      { transactionId: body.transactionId },
      {
        riskScore: score.riskScore,
        riskLevel: score.riskLevel,
        aiReasons: score.aiReasons,
        aiRecommendation: score.aiRecommendation,
        status: newStatus,
        scoringStatus: 'scored'
      }
    );

    // Call notification-service synchronously
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
      await fetch(`${notificationUrl}/internal/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'TRANSACTION_SCORED',
          transactionId: body.transactionId,
          riskScore: score.riskScore,
          riskLevel: score.riskLevel,
          newStatus,
          aiReasons: score.aiReasons,
          action: 'auto-flagged',
          source: 'system'
        })
      });
    } catch (err) {
      console.error('Failed to call local notification service:', err.message);
    }

    res.json({ success: true, score, newStatus });
  } catch (error) {
    console.error('Local scoring error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Scoring Service running on port ${PORT}`);
  });
});

// Trigger deploy
