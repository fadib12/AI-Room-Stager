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
 */
export const generateStagedImages = async (
    prompt: string,
    imageBase64: string,
    count: number = 2
): Promise<string[]> => {
    const base64Images: string[] = [];

    // Generate images sequentially to avoid rate limiting
    for (let i = 0; i < count; i++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt + " Describe in detail how to stage this room."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            });

            const description = response.choices[0]?.message?.content || '';
            
            // Generate image using DALL-E 3 based on the description
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A professionally staged interior room photo with ${prompt} style. ${description}`,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            });

            if (imageResponse.data[0]?.b64_json) {
                base64Images.push(imageResponse.data[0].b64_json);
            }
        } catch (error) {
            console.error(`Error generating image ${i + 1}:`, error);
            // Continue with next iteration even if one fails
        }
    }

    return base64Images;
};

/**
 * Identifies furniture items from an image using OpenAI Vision.
 */
export const identifyFurniture = async (imageBase64: string): Promise<Omit<FurnitureItem, 'id'>[]> => {
    const prompt = 'Analyze the image and identify all distinct furniture items. For each item, provide a short name and a detailed descriptive sentence suitable for a product search. Return the result as a JSON object with an "items" key containing an array of furniture objects with "name" and "description" fields.';

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
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content || '{}';
        const result = JSON.parse(content);
        return result.items || [];
    } catch (error) {
        console.error("Error identifying furniture:", error);
        return [];
    }
};

/**
 * Finds shopping results for a given furniture item.
 */
export const findProducts = async (item: FurnitureItem): Promise<Product[]> => {
    const prompt = `Based on the following furniture item, find 3 to 4 matching products available for purchase online. 
    Item Name: "${item.name}"
    Description: "${item.description}"
    For each product, provide the product name, the store or brand, the approximate price as a string (e.g., "$199.99"), and a direct, valid shopping URL. Do not use placeholder URLs. Return the result as a JSON object with a "products" key containing an array of product objects with fields: "name", "shop", "price", and "url".`;

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
            max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content || '{}';
        const result = JSON.parse(content);
        return result.products || [];
    } catch (error) {
        console.error(`Error finding products for ${item.name}:`, error);
        return [];
    }
};

/**
 * Gets an expert response for a complex design question using GPT-4.
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

        return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("Error getting expert response:", error);
        throw new Error("Failed to get response from AI expert.");
    }
};
