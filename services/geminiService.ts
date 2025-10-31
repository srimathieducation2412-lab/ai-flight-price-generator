
import { GoogleGenAI, Type } from "@google/genai";
import { Flight, GroundingSource, Itinerary } from '../types';

/**
 * Creates and returns a GoogleGenAI client instance.
 * It expects the API key to be available in process.env.API_KEY.
 * @throws {Error} if the API key is not configured.
 */
const getAiClient = () => {
    // The hosting environment is expected to inject the API_KEY.
    // The polyfill in index.html ensures process.env exists.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key is not configured. Please ensure it is set in the environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};


const parseJsonResponse = (text: string): Flight[] | null => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse JSON from model response:", e);
      return null;
    }
  }
  return null;
};

export const findFlights = async (query: string): Promise<{ flights: Flight[], sources: GroundingSource[] }> => {
  try {
    const ai = getAiClient();

    const prompt = `
      You are a world-class flight travel expert. Your task is to find flight routes based on the user's query.
      Use the Google Search tool to find the most relevant and up-to-date information.

      User Query: "${query}"

      Your response MUST be a JSON array of flight objects wrapped in a markdown JSON code block.
      Each object in the array should represent a unique flight option and must have the following structure:
      {
        "from": "Departure Airport Code (e.g., JFK)",
        "to": "Arrival Airport Code (e.g., LHR)",
        "airline": "Airline Name",
        "price": <numeric value in INR, without currency symbol>,
        "stops": <number of stops>,
        "duration": "Total travel time (e.g., '12h 30m')"
      }
      Do not include any text outside of the markdown JSON code block. Provide at least 5 options if possible.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const flightData = parseJsonResponse(response.text);
    if (!flightData) {
        throw new Error("Could not parse flight data from the AI's response.");
    }
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
        .map((chunk: any) => ({
            uri: chunk.web?.uri,
            title: chunk.web?.title,
        }))
        .filter((source: GroundingSource) => source.uri && source.title);

    return { flights: flightData, sources: [...new Map(sources.map(item => [item.uri, item])).values()] }; // a bit of deduplication
    
  } catch (error) {
    console.error("Error fetching flight data from Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key is not configured")) {
        throw new Error("The AI service is not configured. Please ensure the API key is set up correctly in the deployment environment.");
    }
    throw new Error("Failed to fetch flight information. Please try again later.");
  }
};

const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The overall title for the itinerary, e.g., 'A 3-Day Adventure in London'" },
        days: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day number, e.g., 1" },
                    title: { type: Type.STRING, description: "A catchy title for the day's plan, e.g., 'Historic Landmarks & Theatrics'" },
                    activities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING, description: "A time block, e.g., 'Morning', 'Afternoon', 'Evening'" },
                                description: { type: Type.STRING, description: "A detailed description of the activity or suggestion." }
                            },
                            required: ["time", "description"]
                        }
                    }
                },
                required: ["day", "title", "activities"]
            }
        }
    },
    required: ["title", "days"]
};

export const generateItinerary = async (destination: string): Promise<Itinerary> => {
    const prompt = `Generate a detailed and engaging 3-day travel itinerary for a trip to ${destination}. The itinerary should be creative and include a mix of popular attractions, local experiences, and dining suggestions. For each day, provide a title and a list of activities with suggested times (e.g., "Morning", "Afternoon", "Evening").`;

    try {
        const ai = getAiClient();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Itinerary;

    } catch (error) {
        console.error("Error generating itinerary from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API key is not configured")) {
            throw new Error("The AI service is not configured. Please ensure the API key is set up correctly in the deployment environment.");
        }
        throw new Error(`Failed to generate an itinerary for ${destination}. Please try again.`);
    }
};
