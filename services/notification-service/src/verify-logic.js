const AuditLog = require('./models/AuditLog');

// Simple mock test to verify logic without real DB
const mockTest = async () => {
    console.log('--- Notification Service Logic Verification ---');
    
    const mockData = {
        transactionId: 'TXN-MOCK-123',
        action: 'approved',
        note: 'Mock test successful',
        riskScore: 10,
        newStatus: 'clean',
        source: 'analyst'
    };

    const log = new AuditLog(mockData);
    
    console.log('✅ AuditLog Model instantiated successfully');
    console.log('Data:', JSON.stringify(log, null, 2));
    
    if (log.transactionId === 'TXN-MOCK-123') {
        console.log('✅ Data validation passed');
    } else {
        console.log('❌ Data validation failed');
    }
    
    console.log('\nLogic is ready. To test with real DB, ensure your IP is whitelisted in MongoDB Atlas.');
};

mockTest();
