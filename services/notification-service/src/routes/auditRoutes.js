const express = require('express');
const router = express.Router();
const { getAllAuditLogs, getTransactionAuditLog } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllAuditLogs);
router.get('/:txnId', protect, getTransactionAuditLog);

module.exports = router;
