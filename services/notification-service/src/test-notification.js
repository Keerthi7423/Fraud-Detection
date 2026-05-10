require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const AuditLog = require('./models/AuditLog');

const test = async () => {
    console.log('--- Notification Service Test ---');
    
    try {
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Clear old test logs (optional)
        // await AuditLog.deleteMany({ transactionId: 'TXN-TEST-11' });

        // 3. Create a mock Audit Log
        const mockLog = new AuditLog({
            transactionId: 'TXN-TEST-11',
            action: 'auto-flagged',
            note: 'High risk detected by Gemini AI (Mock)',
            riskScore: 92,
            newStatus: 'suspicious',
            source: 'system'
        });

        await mockLog.save();
        console.log('✅ Mock Audit Log saved to database');

        // 4. Generate a Test JWT Token (to test the API manually)
        const testToken = jwt.sign(
            { id: 'admin123', role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        console.log('\n--- API Testing Info ---');
        console.log(`Target URL: http://localhost:3004/audit/TXN-TEST-11`);
        console.log(`Authorization Header: Bearer ${testToken}`);
        console.log('\nYou can use this token in Postman to test the protected GET route.');

        // 5. Verify by querying back
        const logs = await AuditLog.find({ transactionId: 'TXN-TEST-11' });
        console.log(`\n✅ Verified: Found ${logs.length} logs for TXN-TEST-11 in DB`);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Test Complete ---');
        process.exit(0);
    }
};

test();
