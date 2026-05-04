const express = require('express');
const {
  getAllTransactions,
  getOneTransaction,
  createTransaction,
  updateTransactionStatus,
  getReviewQueue,
  getDashboardStats
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', getAllTransactions);
router.get('/queue', getReviewQueue);
router.get('/stats', getDashboardStats);
router.get('/:id', getOneTransaction);
router.post('/', createTransaction);
router.patch('/:id', authorize('admin', 'analyst'), updateTransactionStatus);

module.exports = router;
