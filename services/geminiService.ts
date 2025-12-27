
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  // Always create a fresh instance to ensure the most up-to-date key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  // Using Flash for both to ensure maximum speed and lower latency
  const model = 'gemini-3-flash-preview';

  const systemInstructions = `You are a professional chess engine. 
    Analyze the FEN and provide the best move for the current turn.
    Current Difficulty: ${difficulty}.
    Respond ONLY with the move in SAN format (e.g., "e4", "Nf3", "O-O"). 
    NO conversational text. NO explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.0 : 0.7, // 0.0 for deterministic GM moves
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking to reduce latency to absolute minimum
      },
    });

    const text = (response.text || "").trim();
    // Use a simpler regex that is less prone to stalling
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    return moveMatch ? moveMatch[0] : text;
  } catch (error: any) {
    console.error("Gemini AI move error:", error);
    // Include specific error code if available
    throw new Error(error.status || error.message || "Unknown AI error");
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chess position (FEN): ${fen}`,
      config: {
        systemInstruction: `You are a professional chess coach. 
        Analyze the FEN. Provide the best move in SAN and a one-sentence explanation. 
        Output MUST be valid JSON.`,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["move", "explanation"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Advice error:", error);
    throw error;
  }
};
