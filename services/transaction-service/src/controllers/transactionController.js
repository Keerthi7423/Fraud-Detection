const Transaction = require('../models/Transaction');
const generateMockTransaction = require('../utils/generateMockTransaction');
const { sendToScoringQueue } = require('../services/queueService');

// @desc    Get all transactions with filters
// @route   GET /transactions
// @access  Private
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      minAmount, 
      maxAmount, 
      startDate, 
      endDate, 
      search 
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (category) filter.merchantCategory = category;
    
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { merchantName: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(filter).sort({ timestamp: -1 });
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /transactions/:id
// @access  Private
exports.getOneTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.id });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction (or mock if body is empty)
// @route   POST /transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    let transactionData = req.body;

    if (Object.keys(transactionData).length === 0) {
      transactionData = generateMockTransaction();
    }

    const transaction = await Transaction.create(transactionData);
    
    // Fire and forget - send to AI scoring queue
    sendToScoringQueue(transaction);

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction status (Analyst Review)
// @route   PATCH /transactions/:id
// @access  Private
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status, reviewNote, action } = req.body;

    if (!reviewNote) {
      return res.status(400).json({ success: false, message: 'Review note is required' });
    }

    const transaction = await Transaction.findOne({ transactionId: req.params.id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.status = status || transaction.status;
    transaction.reviewNote = reviewNote;
    transaction.reviewedBy = req.user.id;
    transaction.reviewedByName = req.user.name;
    transaction.reviewedAt = new Date();

    await transaction.save();

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get review queue (pending/suspicious)
// @route   GET /transactions/queue
// @access  Private
exports.getReviewQueue = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: { $in: ['pending', 'suspicious'] }
    }).sort({ riskScore: -1 });

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /transactions/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Transaction.aggregate([
      { $match: { timestamp: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          flaggedCount: { 
            $sum: { $cond: [{ $in: ['$status', ['suspicious', 'fraudulent']] }, 1, 0] } 
          },
          fraudulentCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'fraudulent'] }, 1, 0] } 
          },
          totalFraudAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'fraudulent'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalCount: 0,
      flaggedCount: 0,
      fraudulentCount: 0,
      totalFraudAmount: 0
    };

    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
