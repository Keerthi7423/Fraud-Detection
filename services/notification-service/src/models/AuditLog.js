const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        index: true
    },
    analystId: {
        type: String,
        default: null
    },
    analystName: {
        type: String,
        default: 'system'
    },
    action: {
        type: String,
        enum: ['approved', 'rejected', 'escalated', 'auto-flagged'],
        required: true
    },
    note: {
        type: String
    },
    previousStatus: {
        type: String
    },
    newStatus: {
        type: String
    },
    riskScore: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        enum: ['analyst', 'system'],
        default: 'system'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
