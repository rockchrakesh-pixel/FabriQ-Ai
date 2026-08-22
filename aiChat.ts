import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';

export const aiChatRouter = Router();

const chatLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 40 });

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

aiChatRouter.post('/chat', chatLimiter, async (req: Request, res: Response) => {
  try {
    const { message, userContext } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Valid message string is required' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message exceeds maximum limit of 2000 characters' });
      return;
    }

    const sanitizedContextName = String(userContext?.name || 'Valued Guest').replace(/[<>{}]/g, '').substring(0, 100);
    const sanitizedBranch = String(userContext?.branch || 'Bowenpally Care Atelier').replace(/[<>{}]/g, '').substring(0, 100);
    const sanitizedAddress = String(userContext?.address || 'Hyderabad, Telangana').replace(/[<>{}]/g, '').substring(0, 150);

    const apiKey = process.env.GEMINI_API_KEY;

    const systemInstruction = `You are FabriQ AI Assistant, an elite multi-lingual AI concierge for FabriQ AI — India's premier luxury garment care, dry cleaning, steam ironing, and bespoke fabric studio.

Key Information:
- Services: Dry Cleaning (Suits, Sarees, Jackets), Wash & Steam Iron (₹70/shirt, ₹80/trouser), Express Steam Ironing (₹15/pc self drop), Silk Saree & Couture Care (₹250), Shoe & Sneaker Spa (₹250/pair), Home Care (Curtains, Rugs).
- Branches: Bowenpally Care Atelier (Secunderabad), Suchitra Junction Lounge, Kompally Luxury Studio, Indiranagar (Bengaluru), Mayfair (London).
- Express Turnaround: 24-hour delivery, 15-minute self-drop express ironing.
- Language Capabilities: Fluent in English, Hindi (हिंदी), and Telugu (తెలుగు). Always respond warmly and respectfully in the language used by the customer.
- Order Format: When user confirms items to book, output a summary block with prices, total amount in INR (₹), and pickup slot suggestions.

User Context:
Customer Name: ${sanitizedContextName}
Branch: ${sanitizedBranch}
Address: ${sanitizedAddress}`;

    if (apiKey) {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'I am ready to assist you with your FabriQ AI booking.';
      res.json({ text: replyText });
    } else {
      const lower = message.toLowerCase();
      let fallbackText = `Namaste ${userContext?.name || 'Valued Guest'}! I am FabriQ AI Assistant. How can I help you with dry cleaning, silk saree care, or instant pickup today?`;

      if (lower.includes('telugu') || lower.includes('నమస్కారం') || lower.includes('ధర')) {
        fallbackText = `నమస్కారం! FabriQ AI కి స్వాగతం! 🧺
• షర్ట్ వాష్ & ఐరన్: ₹70
• డ్రై క్లీనింగ్: ₹120 నుండి
• సిల్క్ చీర కేర్: ₹250
• ₹15 ఇన్‌స్టంట్ స్టీమ్ ఐరన్ (స్టోర్ డ్రాప్).
మీకు ఏ సేవ కావాలి?`;
      } else if (lower.includes('hindi') || lower.includes('नमस्ते') || lower.includes('दाम')) {
        fallbackText = `नमस्ते! FabriQ AI में आपका स्वागत है! 🧺
• शर्ट वॉश और स्टीम: ₹70
• ड्राई क्लीनिंग: ₹120 से शुरू
• सिल्क साड़ी केयर: ₹250
• ₹15 इंस्टेंट वैक्यूम स्टीम प्रेस (स्टोर ड्रॉप)।
आप क्या बुक करना चाहते हैं?`;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
        fallbackText = `🏷️ **FabriQ AI Standard Rate Card:**\n• Shirt (Wash & Steam): ₹70\n• Trouser / Denim: ₹80\n• Executive Suit (2-Piece): ₹360\n• Silk Saree & Heritage Couture: ₹250\n• Shoe & Sneaker Spa: ₹250 / pair\n• Express Self-Drop Steam Iron: ₹15 / pc!`;
      }

      res.json({ text: fallbackText });
    }
  } catch (err: any) {
    console.error('Error in /api/chat endpoint:', err);
    res.json({
      text: `Namaste! I am FabriQ AI Concierge. How can I assist you with fabric care, pricing, or garment pickup today?\n\n📞 **Hotline Guidance:** For immediate assistance, feel free to call our Concierge at **1800-202-0000** or **+91 98765 43210**.`,
      quotaExceeded: true,
    });
  }
});
