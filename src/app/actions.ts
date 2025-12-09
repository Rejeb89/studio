
'use server';

import { extractArabicText, type ArabicTextExtractionInput } from '@/ai/flows/arabic-text-extraction';

export async function performOcr(input: ArabicTextExtractionInput) {
  try {
    const result = await extractArabicText(input);
    if (result && result.extractedText) {
      return { success: true, text: result.extractedText };
    }
    return { success: true, text: '' };
  } catch (error) {
    console.error('Error in performOcr:', error);
    return { success: false, error: 'Failed to extract text. Please try again with a clearer image.' };
  }
}
