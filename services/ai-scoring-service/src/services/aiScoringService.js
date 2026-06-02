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
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error("Missing Gemini API Key");
    }
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
    // Manual fallback scoring for local demo when API key is missing
    let riskScore = 10;
    let reasons = ['System rules applied (AI offline)'];
    
    if (transaction.amount > 50000) {
      riskScore += 50;
      reasons.push('High transaction amount');
    }
    
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 23 || hour <= 5) {
      riskScore += 30;
      reasons.push('Late night transaction');
    }
    
    if (['electronics', 'jewelry'].includes(transaction.merchantCategory?.toLowerCase())) {
      riskScore += 20;
      reasons.push('High-risk category');
    }

    let riskLevel = 'low';
    let rec = 'approve';
    if (riskScore > 90) {
      riskLevel = 'critical'; rec = 'block';
    } else if (riskScore > 70) {
      riskLevel = 'high'; rec = 'review';
    } else if (riskScore > 40) {
      riskLevel = 'medium'; rec = 'review';
    }

    return {
      riskScore: Math.min(riskScore, 99),
      riskLevel,
      aiReasons: reasons,
      aiRecommendation: rec
    };
  }
}

module.exports = { scoreTransaction };
