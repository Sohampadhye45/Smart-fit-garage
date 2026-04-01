import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;
// Initialize GenAI client.
// Note: We create a new instance inside functions if we need to ensure fresh state,
// but for simple calls, a shared instance or creating per call is fine. 
// Given the requirements, we'll instantiate per call or globally if env is static.
const ai = new GoogleGenAI({ apiKey: apiKey });

// System instruction for the mechanic persona
const MECHANIC_SYSTEM_INSTRUCTION = `You are SmartFit Garage, an expert master mechanic with 20 years of experience. 
Your goal is to diagnose vehicle (car and bike) problems based on user descriptions and images.
You should be helpful, reassuring, but realistic about safety. 
Always prioritize safety. If a vehicle is unsafe to drive, state it clearly.
Format your responses to be clean, structured, and easy for a non-mechanic to understand.`;

export const diagnoseCarIssue = async (
  details: { make: string; model: string; year: string; mileage: string; symptoms: string },
  imageBase64?: string
): Promise<AnalysisResult> => {
  
  const prompt = `
    Vehicle: ${details.year} ${details.make} ${details.model}
    Mileage: ${details.mileage}
    Symptoms: ${details.symptoms}

    Please analyze this issue.
    If an image is provided, use it to identify warning lights, leaks, or visible damage.
    
    Return the response in strictly valid JSON format matching this schema:
    {
      "title": "Short descriptive title of the issue",
      "severity": "Low" | "Medium" | "High" | "Critical",
      "summary": "2-3 sentences explaining what is likely wrong",
      "possibleCauses": ["List of 3-4 potential specific causes"],
      "estimatedCost": "Estimated repair cost range in Indian Rupees (₹) (e.g. ₹2,000-₹5,000)",
      "diySteps": ["List of 3-5 steps for a DIY fix or things to check before going to a shop"],
      "recommendation": "Final advice (e.g., Drive immediately to shop, Tow it, or Safe to drive for now)"
    }
  `;

  const parts: any[] = [{ text: prompt }];

  if (imageBase64) {
    // Determine mime type roughly or assume jpeg/png based on common web input
    // The input usually comes with prefix like "data:image/png;base64,", we need to strip it for the API usually,
    // but the @google/genai inlineData expects the raw base64 string without the prefix.
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];

    parts.unshift({
      inlineData: {
        data: base64Data,
        mimeType: mimeType || 'image/jpeg'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: MECHANIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            summary: { type: Type.STRING },
            possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedCost: { type: Type.STRING },
            diySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
          },
          required: ['title', 'severity', 'summary', 'possibleCauses', 'estimatedCost', 'diySteps', 'recommendation']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Diagnosis error:", error);
    throw new Error("Failed to diagnose the issue. Please try again.");
  }
};

export const findNearbyMechanics = async (latitude: number, longitude: number, issueTitle: string, carName: string) => {
  try {
    // We use gemini-2.5-flash for Maps Grounding
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find highly-rated mechanics or auto repair shops near me that specialize in: ${issueTitle}. Give FIRST PRIORITY to official authorized ${carName} service centers and list them at the very top of your response. Provide a list of the top 2 official ${carName} service centers, followed by the top 3 independent options. Include their addresses and why they are recommended.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        }
      }
    });

    // We return the raw text (which will be markdown) and the grounding chunks for the UI to render maps links
    return {
      text: response.text,
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Mechanic search error:", error);
    throw new Error("Unable to find nearby mechanics.");
  }
};

export const streamChatResponse = async function* (history: any[], newMessage: string) {
    // Using a new chat session mostly, but here we can just use generateContentStream with history if we want simplified stateless or manage state manually.
    // However, ai.chats.create is better for history.
    
    // Convert history to proper format
    const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: chatHistory,
        config: {
            systemInstruction: MECHANIC_SYSTEM_INSTRUCTION,
        }
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
        yield chunk.text;
    }
};