import { Router, Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from '@google/genai';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';

export const garmentAiRouter = Router();

const aiRateLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 30 });

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

// Fabric Care Advisor API - Protected with auth, rate limiting, and tenant validation
garmentAiRouter.post(
  '/fabric-advisor',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { itemName, category, fabricType, stainType, userNotes } = req.body;

      if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
        res.status(400).json({ error: 'Valid itemName string is required' });
        return;
      }

      if (itemName.length > 500) {
        res.status(400).json({ error: 'itemName exceeds maximum length of 500 characters' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `Provide expert garment care, stain removal protocols, and preservation advice for:
Garment: ${itemName}
Category: ${category || 'Apparel'}
Material / Fabric: ${fabricType || 'Silk / Wool / Fine Textile'}
Stain / Problem: ${stainType || 'General Care & Refresh'}
Special Notes: ${userNotes || 'None'}

Please format the response in clean, bulleted, elegant sections:
1. 🧪 Material Science Analysis
2. 🧼 Professional Atelier Cleaning Protocol
3. 🚨 Emergency Home Spot Treatment
4. 🧥 Archival Storage & Preservation Advice
5. 💎 Recommended FabriQ Care Treatment`;

      if (apiKey) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are FabriQ AI Master Textile Chemist & Garment Care Expert. Provide structured, precise, professional care advice in bullet points.',
            temperature: 0.5,
          },
        });

        res.json({ advice: response.text || 'Protocol generated successfully.' });
      } else {
        const fallbackAdvice = `✨ **FabriQ AI Textile Master Protocol for ${itemName}** (${fabricType || 'Delicate Fabric'}):

• **Material Science:** ${fabricType || 'Luxury Natural Fiber'} features delicate protein/cellulose structures that require low friction and neutral pH hydrocarbon cleaning.
• **Professional Protocol:** Dry clean at 18°C using eco-friendly hydrocarbon solvent, followed by tension-free vacuum steam finishing.
• **Emergency Spot Care:** For ${stainType || 'spots'}, gently dab with a dry lint-free cloth. Avoid heavy rubbing or liquid soap directly on delicate weaves!
• **Archival Storage:** Store in breathable 100% cotton garment bags on broad wooden contour hangers with cedar blocks.
• **FabriQ Specialized Recommendation:** Recommended: *FabriQ ${category || 'Luxury'} Heritage Spa & Anti-Microbial Finish*.`;

        res.json({ advice: fallbackAdvice });
      }
    } catch (err: any) {
      console.error('Error in /api/fabric-advisor endpoint:', err);
      res.status(500).json({ error: 'Failed to process fabric care advisor request', details: err?.message });
    }
  }
);

// Low-Latency Fast Response Endpoint - Protected
garmentAiRouter.post(
  '/gemini/fast-response',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;

      if (prompt && typeof prompt === 'string' && prompt.length > 2000) {
        res.status(400).json({ error: 'Prompt exceeds maximum allowed length of 2000 characters' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt || 'Quick status check for FabriQ garment care.',
        });
        res.json({ text: response.text });
      } else {
        res.json({ text: 'FabriQ AI Instant Response: Service active and valet ready.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Fast response failed', details: err?.message });
    }
  }
);

// Gemini Multimodal Garment Photo Inspection - Protected
garmentAiRouter.post(
  '/gemini/analyze-photo',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', prompt, useHighThinking = true } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Valid imageBase64 string parameter is required' });
        return;
      }

      if (imageBase64.length > 15 * 1024 * 1024) {
        res.status(400).json({ error: 'Image size exceeds maximum limit of 15MB' });
        return;
      }

      const inspectionPrompt = prompt || `Perform a rigorous garment inspection and textile health diagnosis:
1. 🧥 Garment Type & Fabric Identification
2. 🔍 Stain / Damage Classification (Oil, Wine, Friction Wear, Color Bleed, Mold)
3. 🧪 Material Science Cleaning Protocol (Hydrocarbon vs Ozone vs Spot Wash)
4. 💎 Restorability Rating (Percentage 0-100%)
5. 🛡️ Care & Archival Storage Recommendation`;

      if (apiKey) {
        const ai = getGeminiClient();
        const imagePart = {
          inlineData: {
            mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        };
        const textPart = { text: inspectionPrompt };

        const config: any = {
          systemInstruction: 'You are FabriQ Senior Master Textile Inspector & Forensic Chemist.',
        };

        if (useHighThinking) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: { parts: [imagePart, textPart] },
          config,
        });

        res.json({ analysis: response.text, modelUsed: 'gemini-3.1-pro-preview' });
      } else {
        res.json({
          analysis: `🔍 **FabriQ AI Visual Diagnosis Report**:
• **Detected Item:** Mulberry Silk Saree with Zari Embroidery
• **Condition:** Surface liquid spot detected near border weave
• **Restorability Score:** 98.5% (Ideal candidate for Eco-Hydrocarbon Bath)
• **Recommended Treatment:** Atelier Heritage Hand-Spot Extraction & Organic Vapor Finishing.`,
          modelUsed: 'fallback-simulation',
        });
      }
    } catch (err: any) {
      console.error('Error in /api/gemini/analyze-photo:', err);
      res.status(500).json({ error: 'Failed to analyze photo', details: err?.message });
    }
  }
);

// Image Generation - Protected
garmentAiRouter.post(
  '/gemini/generate-image',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { prompt, aspectRatio = '1:1', imageSize = '1K', model = 'gemini-3.1-flash-image' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      if (prompt.length > 1000) {
        res.status(400).json({ error: 'Prompt exceeds maximum limit of 1000 characters' });
        return;
      }

      if (apiKey) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: model || 'gemini-3.1-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });

        let generatedImageUrl = '';
        let generatedText = '';

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            } else if (part.text) {
              generatedText += part.text;
            }
          }
        }

        res.json({ imageUrl: generatedImageUrl, text: generatedText });
      } else {
        res.json({
          imageUrl: '',
          text: `Image generation simulated for prompt "${prompt}" with aspect ratio ${aspectRatio} (${imageSize}).`,
        });
      }
    } catch (err: any) {
      console.error('Error in /api/gemini/generate-image:', err);
      res.status(500).json({ error: 'Failed to generate image', details: err?.message });
    }
  }
);

// Veo AI Video Generation - Protected
garmentAiRouter.post(
  '/gemini/generate-video',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = getGeminiClient();
        const videoConfig: any = {
          model: 'veo-3.1-lite-generate-preview',
          prompt: prompt || 'Cinematic steam pressing and vacuum garment care transformation at FabriQ Atelier',
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
          },
        };

        if (imageBase64) {
          videoConfig.image = {
            imageBytes: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType,
          };
        }

        const operation = await ai.models.generateVideos(videoConfig);
        res.json({ operationName: operation.name });
      } else {
        res.json({ operationName: `simulated_op_${Date.now()}` });
      }
    } catch (err: any) {
      console.error('Error in /api/gemini/generate-video:', err?.message || err);
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
        res.json({
          operationName: `simulated_op_${Date.now()}`,
          quotaExceeded: true,
          message: 'Gemini video generation quota reached. Switched to simulated preview mode.',
        });
        return;
      }
      res.status(500).json({ error: 'Failed to initiate video generation', details: err?.message });
    }
  }
);

garmentAiRouter.post(
  '/gemini/video-status',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!operationName) {
        res.status(400).json({ error: 'operationName parameter is required' });
        return;
      }

      if (apiKey && !operationName.startsWith('simulated_op_')) {
        const ai = getGeminiClient();
        const op = new GenerateVideosOperation();
        op.name = operationName;
        const updated = await ai.operations.getVideosOperation({ operation: op });
        res.json({ done: updated.done, response: updated.response });
      } else {
        res.json({ done: true, simulated: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to poll video status', details: err?.message });
    }
  }
);

garmentAiRouter.post(
  '/gemini/video-download',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && operationName && !operationName.startsWith('simulated_op_')) {
        const ai = getGeminiClient();
        const op = new GenerateVideosOperation();
        op.name = operationName;
        const updated = await ai.operations.getVideosOperation({ operation: op });
        const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

        if (!uri) {
          res.status(404).json({ error: 'Video URI not ready' });
          return;
        }

        const videoRes = await fetch(uri, {
          headers: { 'x-goog-api-key': apiKey },
        });
        res.setHeader('Content-Type', 'video/mp4');
        const arrayBuffer = await videoRes.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      } else {
        res.status(404).json({ error: 'Video download not available in simulation mode' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to download video stream', details: err?.message });
    }
  }
);

// Search Grounding API - Protected
garmentAiRouter.post(
  '/gemini/grounded-search',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      if (query.length > 500) {
        res.status(400).json({ error: 'Query exceeds maximum limit of 500 characters' });
        return;
      }

      if (apiKey) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: query,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        res.json({ text: response.text, groundingChunks: chunks });
      } else {
        res.json({
          text: `Searched web for "${query}": Eco-friendly hydrocarbon solvents are recommended for luxury silk and zari care.`,
          groundingChunks: [{ web: { uri: 'https://fabriq.ai/care-guide', title: 'FabriQ Silk & Atelier Care' } }],
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Search grounding failed', details: err?.message });
    }
  }
);

// Maps Grounding API - Protected
garmentAiRouter.post(
  '/gemini/grounded-maps',
  aiRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      if (query.length > 500) {
        res.status(400).json({ error: 'Query exceeds maximum limit of 500 characters' });
        return;
      }

      if (apiKey) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: query,
          config: {
            tools: [{ googleMaps: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        res.json({ text: response.text, groundingChunks: chunks });
      } else {
        res.json({
          text: `FabriQ AI Atelier locations found near ${query}: Bowenpally Care Atelier (0.8 km), Suchitra Junction (2.4 km).`,
          groundingChunks: [{ web: { uri: 'https://maps.google.com/?q=FabriQ+Bowenpally', title: 'FabriQ Bowenpally Atelier' } }],
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Maps grounding failed', details: err?.message });
    }
  }
);
