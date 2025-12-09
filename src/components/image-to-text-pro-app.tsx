
'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { BookText, Loader2, UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { performOcr } from '@/app/actions';

export function ImageToTextProApp() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleExportToWord = async (text: string) => {
    if (!text) return;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun(text)],
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'imagetotextpro-export.docx');
  };

  const handleExtractText = (data: string) => {
    if (!data) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please upload an image first.',
      });
      return;
    }

    startTransition(async () => {
      const result = await performOcr({ photoDataUri: data });
      if (result.success && result.text) {
        setExtractedText(result.text);
        await handleExportToWord(result.text);
      } else if (result.success) {
        setExtractedText('');
        toast({
          title: 'No Arabic Text Found',
          description: 'The OCR could not find any Arabic text in the image.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Extraction Failed',
          description: result.error,
        });
      }
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload an image file.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setExtractedText('');
        handleExtractText(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-5xl shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">ImageToTextPro</CardTitle>
        <CardDescription>From Image to Document: Arabic Text Extraction Made Simple.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <Label htmlFor="image-upload" className="text-lg">Image</Label>
            <label
              htmlFor="image-upload"
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-colors aspect-video"
            >
              {isPending && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 rounded-md">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                    <span className="mt-4 text-white">Extracting Text...</span>
                </div>
              )}
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded preview"
                  fill
                  className="object-contain rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                  <UploadCloud className="h-12 w-12" />
                  <span className="font-semibold">Click to upload or drag and drop</span>
                  <span className="text-sm">PNG, JPG, or WEBP</span>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                className="sr-only"
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/webp"
                disabled={isPending}
              />
            </label>
          </div>
          <div className="flex flex-col space-y-4">
            <Label htmlFor="extracted-text" className="text-lg">Extracted Text</Label>
            <Textarea
              id="extracted-text"
              placeholder="Your extracted Arabic text will appear here..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[calc(100%-36px)] aspect-video resize-none"
              dir="rtl"
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
      </CardFooter>
    </Card>
  );
}
