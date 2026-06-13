require('dotenv').config({ path: './services/ai-scoring-service/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    console.log("Key prefix:", process.env.GEMINI_API_KEY.substring(0, 5));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Say hello");
    console.log(result.response.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
