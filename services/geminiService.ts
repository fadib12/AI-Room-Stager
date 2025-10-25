
// Service for OpenAI API integration
import OpenAI from 'openai';
import { FurnitureItem, Product } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const openai = new OpenAI({ 
    apiKey: process.env.API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Generates staged images based on a prompt and an original image.
 * Uses GPT-4o to analyze the image and create a detailed description,
 * then uses DALL-E 3 to generate staged images.
 */
export const generateStagedImages = async (
    prompt: string,
    imageDataUrl: string,
    count: number = 2
): Promise<string[]> => {
    const base64Images: string[] = [];

    // First, use GPT-4o to analyze the room image and create a detailed description
    const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Analyze this room image and provide a detailed description including: room type, dimensions/layout, existing features (windows, doors, flooring, walls), lighting conditions, and any existing furniture or fixtures. Be specific and detailed as this will be used to generate a staged version.`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageDataUrl
                        }
                    }
                ]
            }
        ],
        max_tokens: 500
    });

    const roomDescription = analysisResponse.choices[0]?.message?.content || "a room";

    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < count; i++) {
        const dallePrompt = `${prompt}. ${roomDescription}. Create a professionally staged interior design that maintains the room's architecture and features. Style should be realistic and photo-quality.`;
        
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: dallePrompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        });

        if (imageResponse.data && imageResponse.data.length > 0) {
            const b64Data = imageResponse.data[0].b64_json;
            if (b64Data) {
                base64Images.push(b64Data);
            }
        }
    }

    return base64Images;
};

/**
 * Identifies furniture items from an image using GPT-4o vision.
 */
export const identifyFurniture = async (imageDataUrl: string): Promise<Omit<FurnitureItem, 'id'>[]> => {
    const prompt = 'Analyze the image and identify all distinct furniture items. For each item, provide a short name and a detailed descriptive sentence suitable for a product search. Return the result as a JSON object with an "items" key containing an array of furniture objects. Each object should have "name" (string) and "description" (string) properties.';

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageDataUrl
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const jsonStr = response.choices[0]?.message?.content?.trim() || '';
        if (!jsonStr) return [];
        const result = JSON.parse(jsonStr);
        return result.items || [];
    } catch (error) {
        console.error("Error identifying furniture:", error);
        return [];
    }
};

/**
 * Finds shopping results for a given furniture item using GPT-4o.
 */
export const findProducts = async (item: FurnitureItem): Promise<Product[]> => {
    const prompt = `Based on the following furniture item, find 3 to 4 matching products available for purchase online. 
    Item Name: "${item.name}"
    Description: "${item.description}"
    For each product, provide the product name, the store or brand, the approximate price as a string (e.g., "$199.99"), and a direct, valid shopping URL. Do not use placeholder URLs. Return the result as a JSON object with a "products" key containing an array of product objects. Each product object should have "name" (string), "shop" (string), "price" (string), and "url" (string) properties.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500
        });

        const jsonStr = response.choices[0]?.message?.content?.trim() || '';
        if (!jsonStr) return [];
        const result = JSON.parse(jsonStr);
        return result.products || [];
    } catch (error) {
        console.error(`Error finding products for ${item.name}:`, error);
        return [];
    }
};

/**
 * Gets an expert response for a complex design question using GPT-4o.
 * @param prompt The user's question.
 * @returns The expert's response as a string.
 */
export const getExpertResponse = async (prompt: string): Promise<string> => {
    const systemInstruction = 'You are an expert interior designer. Provide detailed, helpful, and well-structured advice. Use markdown for formatting when appropriate.';
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemInstruction
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000
        });

        return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("Error getting expert response:", error);
        throw new Error("Failed to get response from AI expert.");
    }
};
