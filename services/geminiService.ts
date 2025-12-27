
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

const validateKey = (key: string | undefined): string => {
  if (!key || key.trim() === "") {
    throw new Error("API_KEY_MISSING: The environment variable process.env.API_KEY is empty.");
  }
  if (key.startsWith("gen-lang-client")) {
    throw new Error("INVALID_KEY_FORMAT: You provided a Project ID (gen-lang-client-...) instead of a Gemini API Key. Please get a real key (starting with 'AIza') from Google AI Studio.");
  }
  return key;
};

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  const apiKey = validateKey(process.env.API_KEY);
  const ai = new GoogleGenAI({ apiKey });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
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
        temperature: isGrandmaster ? 0.0 : 0.7,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = (response.text || "").trim();
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    return moveMatch ? moveMatch[0] : text;
  } catch (error: any) {
    console.error("Gemini AI move error:", error);
    throw new Error(error.status || error.message || "Unknown AI error");
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const apiKey = validateKey(process.env.API_KEY);
  const ai = new GoogleGenAI({ apiKey });
  
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
  } catch (error: any) {
    console.error("Gemini Advice error:", error);
    throw error;
  }
};
