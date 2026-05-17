const AuditLog = require('../models/AuditLog');

exports.getAllAuditLogs = async (req, res) => {
    try {
        const { analystName, action, startDate, endDate } = req.query;
        let filter = {};

        if (analystName) {
            filter.analystName = { $regex: analystName, $options: 'i' };
        }
        if (action) {
            filter.action = action;
        }
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionAuditLog = async (req, res) => {
    try {
        const logs = await AuditLog.find({ transactionId: req.params.txnId }).sort({ timestamp: -1 });
        if (!logs || logs.length === 0) {
            return res.status(404).json({ error: 'No audit logs found for this transaction' });
        }
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
