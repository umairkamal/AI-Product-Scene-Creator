import { GoogleGenAI, Modality } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCompositeImage = async (
  prompt: string,
  backgroundPart: Part,
  foregroundParts: Part[]
): Promise<{ image: string | null; text: string | null }> => {
  try {
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          textPart,
          backgroundPart,
          ...foregroundParts
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = part.inlineData.data;
        } else if (part.text) {
          generatedText = (generatedText || '') + part.text;
        }
      }
    }

    return { image: generatedImage, text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image. Please check your inputs and try again.");
  }
};

export const generatePromptFromImages = async (
  backgroundPart: Part,
  foregroundParts: Part[]
): Promise<string> => {
  try {
    const instructionText = `Based on the provided background and product images, create a short, creative, and descriptive prompt for a professional advertisement scene. The prompt should instruct another AI on how to blend these images together realistically. For example: 'Place the sneakers on the rocky cliff during a golden sunset, making it look like a professional advertisement.'`;
    
    const textPart = { text: instructionText };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          textPart,
          backgroundPart,
          ...foregroundParts
        ],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for prompt generation:", error);
    throw new Error("Failed to generate a prompt. Please try again.");
  }
};