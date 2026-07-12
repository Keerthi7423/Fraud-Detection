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

module.exports = { sendToScoringQueue };
