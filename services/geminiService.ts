import { GoogleGenAI, Type } from "@google/genai";
import { RoomAnalysis, DesignOptions } from "../types";

// Helper to remove header from base64 if present
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRoom = async (base64Image: string): Promise<RoomAnalysis> => {
  const ai = getClient();
  const cleanData = cleanBase64(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
          { text: `
            Act as a senior interior architect. Analyze this room image.
            1. Identify the Room Type (e.g. Bedroom, Open Kitchen).
            2. Identify the current Design Style (e.g. Dated, Minimalist).
            3. Extract the Color Palette with hex codes.
            4. List key Furniture items detected.
            5. Describe the Lighting (Natural, Artificial, Temperature).
            6. Provide 3 specific architectural suggestions for improvement.
          ` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomType: { type: Type.STRING },
            style: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                }
              }
            },
            furniture: { type: Type.ARRAY, items: { type: Type.STRING } },
            lighting: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RoomAnalysis;
    }
    throw new Error("No analysis data returned");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateRedesign = async (base64Image: string, options: DesignOptions): Promise<string> => {
  const ai = getClient();
  const cleanData = cleanBase64(base64Image);

  // Advanced Prompt Engineering Strategy
  const prompt = `
    Act as a professional interior designer. Transform this room image into a masterpiece.
    
    Target Specifications:
    - Room Type: ${options.roomType}
    - Design Style: ${options.style}
    - Budget Tier: ${options.budget} (Influence material quality and furniture selection)
    - Color Palette Preference: ${options.colorPreference || 'Harmonious with style'}
    
    User Requirements: ${options.additionalPrompt}
    
    Directives:
    1. Preserve structural elements (walls, windows, ceiling height).
    2. Replace furniture and decor to strictly match the '${options.style}' aesthetic.
    3. If Budget is 'Luxury', use premium materials (marble, velvet, gold accents).
    4. If Budget is 'Low', use functional, simple, and affordable-looking aesthetic.
    5. Ensure lighting is photorealistic and enhances the mood.
    
    Output a high-quality, photorealistic image of the redesigned space.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Redesign failed:", error);
    throw error;
  }
};

export const generateRoomVideo = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getClient();
  const cleanData = cleanBase64(base64Image);

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic real estate tour, slow smooth pan, 4k, architectural digest style",
      image: {
        imageBytes: cleanData,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation completed but no URI returned.");

    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
};