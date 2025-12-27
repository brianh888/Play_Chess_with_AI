
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

/**
 * Service to interact with Google Gemini API for chess move generation and advice.
 */

// Cache to store moves we've already calculated to save API calls
const moveCache = new Map<string, string>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getGeminiMove = async (fen: string, difficulty: Difficulty, retryCount = 0): Promise<string> => {
  // 1. Check Cache first
  const cacheKey = `${fen}-${difficulty}`;
  if (moveCache.has(cacheKey)) {
    return moveCache.get(cacheKey)!;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  const model = isGrandmaster ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  // Optimized instructions for speed (less tokens to process)
  const systemInstructions = `You are a chess engine. 
    Difficulty: ${difficulty}.
    Analyze FEN: ${fen}
    Return ONLY the best move in SAN format (e.g. "e4"). No text.`;

  try {
    // 2. Strict 10-second timeout wrapper (Reduced from 20s)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    const apiPromise = ai.models.generateContent({
      model: model,
      contents: `FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.1 : 0.5,
      },
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiPromise, timeoutPromise]);

    // Type assertion because Promise.race returns generic type of the winner
    const text = ((response as any).text || "").trim();
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    const result = moveMatch ? moveMatch[0] : text;

    // 3. Save to cache if valid
    if (result) {
      moveCache.set(cacheKey, result);
    }
    return result;

  } catch (error: any) {
    // If it's a timeout, strictly throw it so App.tsx can handle the fallback immediately
    if (error.message === "TIMEOUT") {
      throw error;
    }

    // 4. Retry logic for Rate Limits (429)
    if (error.message?.includes("429") && retryCount < 3) {
      console.warn(`Rate limit hit. Retrying in ${(retryCount + 1) * 1} seconds...`); // Faster retry
      await delay(1000 * (retryCount + 1)); 
      return getGeminiMove(fen, difficulty, retryCount + 1);
    }

    console.error("Gemini Move Error:", error);
    throw error;
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chess position (FEN): ${fen}`,
      config: {
        systemInstruction: `You are a master chess coach. 
        Analyze the FEN. Identify the best move and provide a one-sentence strategic explanation. 
        The output must be JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { 
              type: Type.STRING,
              description: "The recommended move in SAN format."
            },
            explanation: { 
              type: Type.STRING,
              description: "Brief tactical explanation of why this move is best."
            }
          },
          required: ["move", "explanation"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Advice Error:", error);
    throw error;
  }
};
