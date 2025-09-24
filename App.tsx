
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { PromptPreview } from './components/PromptPreview';
import { OutputDisplay } from './components/OutputDisplay';
import { Toast } from './components/Toast';
import { generateProductImage } from './services/geminiService';
import type { ToastMessage, ControlSettings } from './types';
import { INITIAL_SETTINGS } from './constants';

const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ data, mimeType });
    };
    reader.onerror = error => reject(error);
  });
};

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<ControlSettings>(INITIAL_SETTINGS);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (uploadedFile) {
      const objectUrl = URL.createObjectURL(uploadedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [uploadedFile]);

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      setToast({ message: 'Image uploaded successfully!', type: 'success' });
    }
  };

  const handleSettingsChange = <K extends keyof ControlSettings,>(key: K, value: ControlSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generatedPrompt = useMemo(() => {
    const { lighting, background, mockup, aspectRatio } = settings;
    return `Professional product photography of the product in the uploaded image.
    - Lighting: Use ${lighting.label}. ${lighting.description}.
    - Background/Scene: Place it on a ${background.label} background. ${background.description}.
    - Style: Present it as a ${mockup.label} shot. ${mockup.description}.
    - Framing: The final image must have a ${aspectRatio.label} (${aspectRatio.value}) aspect ratio.
    - Core Instruction: Maintain the exact appearance of the uploaded product, including all authentic details, textures, and characteristics. Reconstruct any blurred or out-of-focus areas to be sharp and clear, matching the visible product features.
    - Constraints: Do not enhance, idealize, or alter the product itself. Only correct photography flaws and place the pristine product in the new, specified environment.
    - Desired Outcome: A polished, high-resolution, studio-quality professional photograph suitable for e-commerce.`;
  }, [settings]);

  const handleGenerate = useCallback(async () => {
    if (!uploadedFile) {
      setToast({ message: 'Please upload a product image first.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setToast({ message: 'Generating your professional product photo... this can take a moment.', type: 'info' });

    try {
      const { data: imageBase64, mimeType } = await fileToBase64(uploadedFile);
      const resultBase64 = await generateProductImage(generatedPrompt, imageBase64, mimeType);
      
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
      setToast({ message: 'Image generated successfully!', type: 'success' });
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setToast({ message: `Generation failed: ${errorMessage}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, generatedPrompt]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ImageUploader onFileSelect={handleFileSelect} previewUrl={previewUrl} />
            <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
          </div>
          <div className="space-y-8">
            <PromptPreview prompt={generatedPrompt} />
            <OutputDisplay 
              generatedImage={generatedImage}
              isLoading={isLoading}
              onGenerate={handleGenerate} 
              isReadyToGenerate={!!uploadedFile}
            />
          </div>
        </div>
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
