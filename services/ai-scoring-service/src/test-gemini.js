require('dotenv').config();
const { scoreTransaction } = require('./services/aiScoringService');

async function runTests() {
  console.log('--- Testing High Risk Transaction ---');
  const highRiskResult = await scoreTransaction({
    transactionId: 'TXN-TEST1',
    amount: 89000,
    merchantName: 'Apple Store',
    merchantCategory: 'electronics',
    location: { city: 'Dubai', country: 'UAE' },
    timestamp: new Date('2025-01-02T02:30:00Z'),
    cardType: 'credit',
    cardLastFour: '9821'
  });
  console.log(JSON.stringify(highRiskResult, null, 2));

  console.log('\n--- Testing Low Risk Transaction ---');
  const lowRiskResult = await scoreTransaction({
    transactionId: 'TXN-TEST2',
    amount: 250,
    merchantName: 'Zomato',
    merchantCategory: 'food',
    location: { city: 'Bengaluru', country: 'India' },
    timestamp: new Date('2025-01-02T12:30:00Z'),
    cardType: 'debit',
    cardLastFour: '1234'
  });
  console.log(JSON.stringify(lowRiskResult, null, 2));
}

runTests();
