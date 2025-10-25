/**
 * Converts a File object to a base64 encoded string for use with OpenAI API.
 */
export const fileToBase64 = async (file: File): Promise<string> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return await base64EncodedDataPromise;
};

/**
 * Legacy function name maintained for backwards compatibility.
 * @deprecated Use fileToBase64 instead
 */
export const fileToGenerativePart = fileToBase64;

