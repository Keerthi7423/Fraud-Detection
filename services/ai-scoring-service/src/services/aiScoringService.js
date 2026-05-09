const model = require('../config/geminiClient');

async function scoreTransaction(transaction) {
  const prompt = `
    You are a bank fraud detection AI system.
    Analyze this transaction and return ONLY a JSON object.
    No explanation. No markdown. No code fences. Just raw JSON.

    Transaction:
    - ID: ${transaction.transactionId}
    - Amount: ${transaction.amount} INR
    - Merchant: ${transaction.merchantName}
    - Category: ${transaction.merchantCategory}
    - Location: ${transaction.location.city}, ${transaction.location.country}
    - Time: ${transaction.timestamp}
    - Card Type: ${transaction.cardType}
    - Card Last 4: ${transaction.cardLastFour}

    Return exactly this JSON:
    {
      "riskScore": <number 0-100>,
      "riskLevel": <"low" or "medium" or "high" or "critical">,
      "reasons": ["reason1", "reason2", "reason3"],
      "recommendation": <"approve" or "review" or "block">
    }

    Scoring rules:
    0-40   = low risk, normal transaction
    41-70  = medium risk, some flags, needs review
    71-90  = high risk, likely fraudulent
    91-100 = critical, block immediately

    Flag these patterns:
    - Late night time (11PM - 5AM) = suspicious
    - Amount above 50000 INR = suspicious
    - Electronics or jewelry category = higher risk
    - Unusual location = suspicious
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Remove any markdown fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      riskScore: parsed.riskScore,
      riskLevel: parsed.riskLevel,
      aiReasons: parsed.reasons,
      aiRecommendation: parsed.recommendation
    };
  } catch (err) {
    console.error('Gemini scoring error:', err.message);
    // Return default safe score if AI fails — do not crash
    return {
      riskScore: 0,
      riskLevel: 'low',
      aiReasons: ['AI scoring unavailable'],
      aiRecommendation: 'review'
    };
  }
}

module.exports = { scoreTransaction };
