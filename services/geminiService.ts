

// FIX: Updated imports to use the modern '@google/genai' package and new types like GenerateContentResponse, Modality, and Type.
import { GoogleGenAI, Part, GenerateContentResponse, Modality, Type } from '@google/genai';
// FIX: Added imports for new types used in the "Shop the Look" feature.
import { FurnitureItem, Product } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates staged images based on a prompt and an original image.
 */
export const generateStagedImages = async (
    prompt: string,
    imagePart: Part,
    count: number = 2
): Promise<string[]> => {
    // FIX: Refactored to use the modern `ai.models.generateContent` API instead of the deprecated `getGenerativeModel`.
    const model = 'gemini-2.5-flash-image';
    const contents = { parts: [imagePart, { text: prompt }] };
    const base64Images: string[] = [];

    // FIX: Changed from parallel (Promise.all) to sequential requests to avoid API rate limiting (429 error).
    for (let i = 0; i < count; i++) {
        const result = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        // FIX: Updated response handling to directly access `result.candidates` instead of the deprecated `result.response`.
        if (result.candidates && result.candidates.length > 0) {
            for (const part of result.candidates[0].content.parts) {
                if (part.inlineData) {
                    base64Images.push(part.inlineData.data);
                }
            }
        }
    }

    return base64Images;
};

// FIX: Added identifyFurniture function to detect furniture in an image using Gemini's JSON mode.
/**
 * Identifies furniture items from an image using Gemini.
 */
export const identifyFurniture = async (imagePart: Part): Promise<Omit<FurnitureItem, 'id'>[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = 'Analyze the image and identify all distinct furniture items. For each item, provide a short name and a detailed descriptive sentence suitable for a product search. Return the result as a JSON object with an "items" key containing an array of furniture objects.';

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: 'A short name for the furniture item (e.g., "Wooden Chair", "Blue Sofa").'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A detailed description for product search (e.g., "A mid-century modern armchair with light-colored wooden legs and blue fabric upholstery.").'
                                    }
                                },
                                required: ['name', 'description']
                            }
                        }
                    },
                    required: ['items']
                }
            }
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) return [];
        const result = JSON.parse(jsonStr);
        return result.items || [];
    } catch (error) {
        console.error("Error identifying furniture:", error);
        return [];
    }
};

// FIX: Added findProducts function to search for products based on a description using Gemini's JSON mode.
/**
 * Finds shopping results for a given furniture item.
 */
export const findProducts = async (item: FurnitureItem): Promise<Product[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Based on the following furniture item, find 3 to 4 matching products available for purchase online. 
    Item Name: "${item.name}"
    Description: "${item.description}"
    For each product, provide the product name, the store or brand, the approximate price as a string (e.g., "$199.99"), and a direct, valid shopping URL. Do not use placeholder URLs. Return the result as a JSON object with a "products" key containing an array of product objects.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        products: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The full name of the product." },
                                    shop: { type: Type.STRING, description: "The name of the store or brand selling the product." },
                                    price: { type: Type.STRING, description: "The price of the product as a formatted string (e.g., '$199.99')." },
                                    url: { type: Type.STRING, description: "A direct, valid URL to the product page." }
                                },
                                required: ['name', 'shop', 'price', 'url']
                            }
                        }
                    },
                    required: ['products']
                }
            }
        });
        const jsonStr = response.text.trim();
        if (!jsonStr) return [];
        const result = JSON.parse(jsonStr);
        return result.products || [];
    } catch (error) {
        console.error(`Error finding products for ${item.name}:`, error);
        return [];
    }
};

// FIX: Add getExpertResponse function for the "Ask an AI Design Expert" feature.
/**
 * Gets an expert response for a complex design question using Gemini 2.5 Pro with thinking enabled.
 * @param prompt The user's question.
 * @returns The expert's response as a string.
 */
export const getExpertResponse = async (prompt: string): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = 'You are an expert interior designer. Provide detailed, helpful, and well-structured advice. Use markdown for formatting when appropriate.';
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                // Use a high thinking budget for complex reasoning tasks.
                thinkingConfig: { thinkingBudget: 32768 }
            },
            systemInstruction: systemInstruction,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting expert response:", error);
        throw new Error("Failed to get response from AI expert.");
    }
};
