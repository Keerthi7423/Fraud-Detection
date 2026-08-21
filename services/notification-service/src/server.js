require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'https://d49m8z8w0jzwy.cloudfront.net', 'http://d49m8z8w0jzwy.cloudfront.net', 'https://fraud-detection-theta-two.vercel.app'], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/audit', require('./routes/auditRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});

// Internal webhook for local dev (replaces SQS)
app.post('/internal/audit', async (req, res) => {
    try {
        const body = req.body;
        const AuditLog = require('./models/AuditLog');
        const auditLog = new AuditLog({
            transactionId: body.transactionId,
            analystId: body.analystId,
            analystName: body.analystName || 'system',
            action: body.action,
            note: body.note || (body.aiReasons ? body.aiReasons.join(', ') : ''),
            previousStatus: body.previousStatus,
            newStatus: body.newStatus,
            riskScore: body.riskScore,
            source: body.analystId ? 'analyst' : 'system'
        });
        await auditLog.save();
        console.log(`Internal Audit logged: ${body.transactionId} -> ${body.action}`);
        
        try {
            const io = require('./config/socket').getIO();
            io.emit('NEW_NOTIFICATION', {
                transactionId: body.transactionId,
                action: body.action,
                riskScore: body.riskScore,
                newStatus: body.newStatus,
                note: auditLog.note,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('WebSocket emit error:', err.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Internal Audit Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start Worker removed

const PORT = process.env.PORT || 3004;
const server = require('http').createServer(app);
require('./config/socket').init(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Notification Service running on port ${PORT}`);
});

// Trigger deploy
