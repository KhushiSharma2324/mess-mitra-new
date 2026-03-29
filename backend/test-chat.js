const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('./src/config/db');

async function test() {
  try {
    const messes = await prisma.mess.findMany({
      where: { isActive: true },
      take: 2,
      include: { plans: { where: { isActive: true } } }
    });
    
    console.log("DB Context:", messes.length);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Test prompt from messmitra. Query: hi.`;
    
    console.log("Attempting Gemini API request...");
    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    process.exit(0);
  }
}
test();
