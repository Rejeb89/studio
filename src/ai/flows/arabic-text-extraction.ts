'use server';

/**
 * @fileOverview A flow that extracts Arabic text from an image using OCR.
 *
 * - extractArabicText - A function that handles the Arabic text extraction process.
 * - ArabicTextExtractionInput - The input type for the extractArabicText function.
 * - ArabicTextExtractionOutput - The return type for the extractArabicText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArabicTextExtractionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing Arabic text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ArabicTextExtractionInput = z.infer<typeof ArabicTextExtractionInputSchema>;

const ArabicTextExtractionOutputSchema = z.object({
  extractedText: z.string().describe('The extracted Arabic text from the image.'),
});
export type ArabicTextExtractionOutput = z.infer<typeof ArabicTextExtractionOutputSchema>;

export async function extractArabicText(input: ArabicTextExtractionInput): Promise<ArabicTextExtractionOutput> {
  return arabicTextExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'arabicTextExtractionPrompt',
  input: {schema: ArabicTextExtractionInputSchema},
  output: {schema: ArabicTextExtractionOutputSchema},
  prompt: `You are an expert OCR engine specializing in extracting Arabic text from images.  

  Extract all the Arabic text from the following image.  If the image doesn't contain Arabic text, respond with an empty string.

  Image: {{media url=photoDataUri}}
  `,
});

const arabicTextExtractionFlow = ai.defineFlow(
  {
    name: 'arabicTextExtractionFlow',
    inputSchema: ArabicTextExtractionInputSchema,
    outputSchema: ArabicTextExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
