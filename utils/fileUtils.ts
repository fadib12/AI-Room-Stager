// Utility functions for handling file conversions for OpenAI API

/**
 * Converts a File to a base64 data URL for OpenAI vision API
 */
export const fileToBase64DataUrl = async (file: File): Promise<string> => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result); // This is already a data URL (data:image/...;base64,...)
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Converts base64 data (without prefix) to a data URL
 */
export const base64ToDataUrl = (base64: string, mimeType: string = 'image/png'): string => {
    return `data:${mimeType};base64,${base64}`;
};
