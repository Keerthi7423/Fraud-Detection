const sendToScoringQueue = async (transaction) => {
  const scoringUrl = process.env.SCORING_SERVICE_URL || 'http://localhost:3003';
  try {
    fetch(`${scoringUrl}/internal/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageType: 'SCORE_TRANSACTION',
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        merchantName: transaction.merchantName,
        merchantCategory: transaction.merchantCategory,
        location: transaction.location,
        timestamp: transaction.timestamp,
        cardType: transaction.cardType,
        cardLastFour: transaction.cardLastFour
      })
    }).catch(err => console.error("Scoring failed:", err.message));
  } catch(err) {
    console.error(err);
  }
};

const sendToAuditQueue = async (data) => {
  const isProd = process.env.NODE_ENV === 'production';
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || (isProd ? 'http://notification-service:3004' : 'http://localhost:3004');
  try {
    fetch(`${notificationUrl}/internal/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error("Audit logging failed:", err.message));
  } catch(err) {
    console.error(err);
  }
};

module.exports = { sendToScoringQueue, sendToAuditQueue };
