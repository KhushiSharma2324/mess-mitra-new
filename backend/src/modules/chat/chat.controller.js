const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../../config/db');

exports.handleChatQuery = async (req, res, next) => {
  // Hoist these so they are accessible in both try and catch blocks
  let query, messes = [], menus = [];

  try {
    query = req.body.query;
    if (!query) return res.status(400).json({ success: false, message: 'Wait, I need a query to answer!' });
    
    // Check if API key is loaded
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ success: true, message: 'Your GEMINI_API_KEY is not set in the .env file.' });
    }

    // 1. Fetch rich context data from the database
    messes = await prisma.mess.findMany({
      where: { isActive: true },
      take: 20,
      include: {
        plans: {
          where: { isActive: true }
        }
      }
    });

    menus = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      take: 20,
      include: { mess: true }
    });

    // 2. Format context for AI
    const messContext = messes.map(m => {
      const plansInfo = m.plans.map(p => `${p.name} (${p.foodCategory}, ₹${p.price})`).join(', ');
      return `- ${m.name} located at ${m.address}. Rating: ${m.avgRating}. Category: ${m.category}. Plans: ${plansInfo || 'None'}`;
    }).join('\n');
    
    const menuContext = menus.map(m => {
      return `- ${m.itemName} (${m.mealType}) at ${m.mess.name}`;
    }).join('\n');

    // 3. Setup Gemini API using the new keys supported model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Construct System Prompt
    const prompt = `
You are MessMitra's smart chatbot assistant answering user queries strictly based on the provided database context and the FAQs below. Keep your response helpful, concise, formatting nicely (with emojis), and directly to the point.
If a user asks something completely outside of MessMitra (like sports or math), politely deny answering. If the user just says "hi", greet them back and ask how you can help!

MessMitra FAQs (Frequently Asked Questions):
- "How do I subscribe?" -> "Go to any mess profile and click 'Subscribe' on a plan!"
- "Can I cancel a meal?" -> "Yes, mark 'Absent' in your daily attendance tab. Check with the mess owner regarding their exact refund/carry-forward policy."
- "How do I pay?" -> "Currently payments are handled directly with mess owners via cash or UPI."
- "What if the food is bad?" -> "You can leave an honest review and rating for any meal after delivery!"
- "Is delivery free?" -> "Delivery limits vary by mess. Check their specific plans for details."

AVAILABLE MESSES & PLANS:
${messContext}

AVAILABLE MENU ITEMS TODAY:
${menuContext}

USER QUERY:
${query}
`;

    // 5. Query AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: text
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    if (error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Quota'))) {
      
      console.log('Falling back to local keyword matcher due to API limit...');
      // --- LOCAL FALLBACK BOT ENGINE (expanded) ---
      const q = (query || '').toLowerCase();
      let responseText = '';

      // Greetings
      if (q.match(/\b(hi|hello|hey|hlo|hii|namaste|sup|yo)\b/)) {
        responseText = "👋 Hello! I'm MessMitra AI (running in backup mode right now). I can help you find messes, check menus, or answer questions about plans. What would you like to know?";

      // All messes / list messes
      } else if (q.match(/\b(all|list|show|find|available|near|mess(es)?|provider)\b/)) {
        const list = messes.slice(0, 5);
        responseText = list.length
          ? `🍱 Here are the available messes:\n` + list.map(m => `- **${m.name}** (${m.category === 'PURE_VEG' ? '🟢 Veg' : m.category === 'NONVEG' ? '🔴 Non-Veg' : '🟡 Both'}) — ${m.address}`).join('\n')
          : "No active messes found right now.";

      // Veg
      } else if (q.match(/\b(veg|vegetarian|veggie|pure.?veg)\b/) && !q.includes('non')) {
        const list = messes.filter(m => m.category === 'PURE_VEG' || m.category === 'BOTH').slice(0, 4);
        responseText = list.length
          ? "🟢 Veg-friendly messes:\n" + list.map(m => `- **${m.name}** — ${m.address}`).join('\n')
          : "No veg messes found right now.";

      // Non-veg
      } else if (q.match(/\b(non.?veg|nonveg|chicken|mutton|fish|egg|meat)\b/)) {
        const list = messes.filter(m => m.category === 'NONVEG' || m.category === 'BOTH').slice(0, 4);
        responseText = list.length
          ? "🔴 Non-veg messes:\n" + list.map(m => `- **${m.name}** — ${m.address}`).join('\n')
          : "No non-veg messes found right now.";

      // Menu / food today
      } else if (q.match(/\b(menu|food|today|meal|breakfast|lunch|dinner|item|dish)\b/)) {
        responseText = menus.length
          ? "🍽️ Here's what's available today:\n" + menus.slice(0, 5).map(m => `- **${m.itemName}** (${m.mealType}) at ${m.mess.name}`).join('\n')
          : "No menu items posted for today yet. Check back later!";

      // Plans / pricing
      } else if (q.match(/\b(plan|price|cost|rate|cheap|affordable|expensive|budget|₹|rs|rupee|pay|payment|fee|charge)\b/)) {
        const withPlans = messes.filter(m => m.plans && m.plans.length > 0).slice(0, 4);
        responseText = withPlans.length
          ? "💰 Here are some messes with active plans:\n" + withPlans.map(m => {
              const plans = m.plans.map(p => `₹${p.price} (${p.name})`).join(', ');
              return `- **${m.name}**: ${plans}`;
            }).join('\n')
          : "Check individual mess profiles for their plan pricing!";

      // Subscribe
      } else if (q.match(/\b(subscribe|subscription|join|enroll|sign.?up|register)\b/)) {
        responseText = "✅ To subscribe to a mess:\n1. Browse the mess list\n2. Click on any mess card\n3. Choose a Plan that suits you\n4. Click the **Subscribe** button on the plan!";

      // Cancel / absent
      } else if (q.match(/\b(cancel|skip|absent|leave|off|holiday|miss)\b/)) {
        responseText = "🔴 To skip a meal, open your **Attendance** tab and mark yourself as **Absent** for that day. Check with your mess owner about their refund/carry-forward policy!";

      // Delivery
      } else if (q.match(/\b(deliver|delivery|home|hostel|room)\b/)) {
        responseText = "🚚 Delivery availability depends on the mess. Some messes offer hostel delivery — check the specific mess profile for delivery details!";

      // Rating / review
      } else if (q.match(/\b(rating|review|rate|feedback|good|best|top)\b/)) {
        const topMesses = [...messes].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
        responseText = topMesses.length
          ? "⭐ Top rated messes right now:\n" + topMesses.map(m => `- **${m.name}** — ⭐ ${Number(m.avgRating).toFixed(1)}`).join('\n')
          : "No rated messes found yet. Be the first to review!";

      // Contact / owner / help
      } else if (q.match(/\b(contact|owner|help|support|problem|issue)\b/)) {
        responseText = "📞 For any issues, please contact the mess owner directly through their profile page. For platform support, reach out to MessMitra admin!";

      // Fallback for anything else — list all messes as best-effort answer
      } else {
        const list = messes.slice(0, 3);
        responseText = `🤖 I'm in backup mode and couldn't find a specific answer for *"${query}"*.\n\nHere are some active messes you can explore:\n`
          + (list.length ? list.map(m => `- **${m.name}** — ${m.address}`).join('\n') : "No messes found.")
          + "\n\nFor detailed answers, please try again tomorrow when my AI brain resets! 😊";
      }

      // Add a small synthetic delay so it feels natural
      await new Promise(resolve => setTimeout(resolve, 600));

      return res.status(200).json({
        success: true,
        data: responseText
      });
    }

    let msg = 'Oops, I had a short circuit: ' + (error.message || 'Unknown error');
    if (error.message && error.message.includes('safety')) {
      msg = 'I cannot answer that due to safety filters.';
    }
    res.status(500).json({ success: false, message: msg });
  }
};
