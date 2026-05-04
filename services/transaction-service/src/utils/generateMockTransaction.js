const merchants = [
  'Amazon', 'Flipkart', 'Zomato', 'Swiggy', 'IRCTC',
  'MakeMyTrip', 'Myntra', 'BigBasket', 'PhonePe', 'Paytm',
  'Croma', 'Reliance Digital', 'BookMyShow', 'OYO', 'Uber',
  'Ola', 'Nykaa', 'HDFC ATM', 'Petrol Pump', 'Hospital'
];

const categories = [
  'food', 'travel', 'electronics', 'clothing', 'fuel',
  'medical', 'entertainment', 'finance'
];

const cities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'
];

const generateMockTransaction = () => {
  const amount = Math.floor(Math.random() * (95000 - 500 + 1)) + 500;
  const merchantName = merchants[Math.floor(Math.random() * merchants.length)];
  const merchantCategory = categories[Math.floor(Math.random() * categories.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    transactionId: 'TXN-' + Math.random().toString().slice(2, 7),
    amount,
    currency: 'INR',
    merchantName,
    merchantCategory,
    location: {
      city,
      country: 'India',
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    },
    cardLastFour: Math.floor(1000 + Math.random() * 9000).toString(),
    cardType: Math.random() > 0.5 ? 'credit' : 'debit',
    userId: 'USER-' + Math.floor(100 + Math.random() * 900),
    timestamp: new Date(),
    status: 'pending',
    riskScore: 0,
    scoringStatus: 'queued'
  };
};

module.exports = generateMockTransaction;
