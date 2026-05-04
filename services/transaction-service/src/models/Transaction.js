const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  merchantName: {
    type: String,
    required: true
  },
  merchantCategory: {
    type: String,
    required: true
  },
  cardLastFour: {
    type: String
  },
  cardType: {
    type: String,
    enum: ['credit', 'debit']
  },
  location: {
    city: String,
    country: String,
    ipAddress: String
  },
  userId: {
    type: String
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'clean', 'suspicious', 'fraudulent'],
    default: 'pending'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  aiReasons: {
    type: [String],
    default: []
  },
  aiRecommendation: {
    type: String,
    enum: ['approve', 'review', 'block'],
    default: 'review'
  },
  reviewedBy: {
    type: String
  },
  reviewedByName: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String
  },
  scoringStatus: {
    type: String,
    enum: ['queued', 'scoring', 'scored'],
    default: 'queued'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ riskScore: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
