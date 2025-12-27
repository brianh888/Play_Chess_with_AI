
import { GoogleGenAI, Type } from "@google/genai";
import { Advice } from "../types";

/**
 * Service to interact with Google Gemini API for chess move generation and advice.
 * Includes local caching and retry logic to mitigate rate limiting.
 */

const moveCache = new Map<string, string>();
const adviceCache = new Map<string, Advice>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getGeminiMove = async (fen: string, retries = 2): Promise<string> => {
  if (moveCache.has(fen)) {
    return moveCache.get(fen)!;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstructions = `You are a professional chess engine. 
    Analyze the FEN and provide the best move for the current turn.
    Respond ONLY with the move in Standard Algebraic Notation (SAN) format (e.g., "e4", "Nf3", "O-O"). 
    NO conversational text. NO explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Current board position in FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking to save tokens and speed up response
      },
    });

    const text = (response.text || "").trim();
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    const move = moveMatch ? moveMatch[0] : text;
    
    if (move && move.length > 0) {
      moveCache.set(fen, move);
    }
    return move;
  } catch (error: any) {
    if (retries > 0 && error.message?.includes("429")) {
      await delay(2000 * (3 - retries)); // Exponential backoff
      return getGeminiMove(fen, retries - 1);
    }
    console.error("Gemini Move Error:", error);
    throw error;
  }
};

export const getGeminiAdvice = async (fen: string, retries = 1): Promise<Advice> => {
  if (adviceCache.has(fen)) {
    return adviceCache.get(fen)!;
  }

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
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const advice: Advice = JSON.parse(response.text || "{}");
    if (advice.move) {
      adviceCache.set(fen, advice);
    }
    return advice;
  } catch (error: any) {
    if (retries > 0 && error.message?.includes("429")) {
      await delay(1500);
      return getGeminiAdvice(fen, retries - 1);
    }
    console.error("Gemini Advice Error:", error);
    throw error;
  }
};
