import React, { useState, useCallback } from 'react';
import { generateCompositeImage, generatePromptFromImages } from './services/geminiService';
import type { ImageFile } from './types';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { ResultDisplay } from './components/ResultDisplay';

const App: React.FC = () => {
  const [background, setBackground] = useState<ImageFile | null>(null);
  const [foregrounds, setForegrounds] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type }
    };
  };

  const handleGenerate = useCallback(async () => {
    if (!background || foregrounds.length === 0 || !prompt) {
      setError('Please provide a background, at least one foreground image, and a descriptive prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      const backgroundPart = await fileToGenerativePart(background.file);
      const foregroundParts = await Promise.all(foregrounds.map(f => fileToGenerativePart(f.file)));

      const result = await generateCompositeImage(prompt, backgroundPart, foregroundParts);
      
      if (result.image) {
        setGeneratedImage(`data:image/png;base64,${result.image}`);
      }
      if (result.text) {
        setGeneratedText(result.text);
      }
      if (!result.image && !result.text) {
          setError("The AI model did not return an image or text. Please try refining your prompt.");
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [background, foregrounds, prompt]);

  const handleAutoGeneratePrompt = useCallback(async () => {
    if (!background || foregrounds.length === 0) {
      setError('Please upload a background and at least one product image first.');
      return;
    }

    setIsGeneratingPrompt(true);
    setError(null);

    try {
      const backgroundPart = await fileToGenerativePart(background.file);
      const foregroundParts = await Promise.all(foregrounds.map(f => fileToGenerativePart(f.file)));

      const generatedPrompt = await generatePromptFromImages(backgroundPart, foregroundParts);
      setPrompt(generatedPrompt);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate prompt.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [background, foregrounds]);
  
  const handleRemoveForeground = (id: string) => {
      setForegrounds(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Product Scene Creator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Blend products into any background to create stunning, realistic photoshoots.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Column */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div>
              <h2 className="text-2xl font-bold mb-3 text-purple-300">1. Upload Your Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader
                      label="Background Image"
                      onImageSelect={(file, preview) => setBackground({ file, preview, id: 'background' })}
                      previewUrl={background?.preview}
                      onClear={() => setBackground(null)}
                  />
                  <ImageUploader
                      label="Product Image(s)"
                      onImageSelect={(file, preview) => setForegrounds(prev => [...prev, { file, preview, id: crypto.randomUUID() }])}
                      multiple={true}
                  />
              </div>
              {foregrounds.length > 0 && (
                  <div className="mt-4">
                      <h3 className="font-semibold text-gray-300 mb-2">Uploaded Products:</h3>
                      <div className="flex flex-wrap gap-3">
                          {foregrounds.map((fg) => (
                              <div key={fg.id} className="relative group">
                                  <img src={fg.preview} alt="Foreground product" className="h-20 w-20 object-cover rounded-md border-2 border-gray-600"/>
                                  <button
                                      onClick={() => handleRemoveForeground(fg.id)}
                                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="Remove image"
                                  >
                                      X
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-purple-300">2. Describe The Scene</h2>
                 <button
                  onClick={handleAutoGeneratePrompt}
                  disabled={isGeneratingPrompt || !background || foregrounds.length === 0}
                  className="flex items-center gap-2 py-1 px-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Auto-generate prompt based on images"
                >
                  {isGeneratingPrompt ? (
                    <Spinner />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                  Auto-generate
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Place the sneakers on the rocky cliff during a golden sunset, making it look like a professional advertisement."
                className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            <div>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !background || foregrounds.length === 0 || !prompt}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isLoading && <Spinner />}
                {isLoading ? 'Generating Your Masterpiece...' : 'Generate Scene'}
              </button>
            </div>
            {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
          </div>

          {/* Result Column */}
          <div className="flex items-center justify-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700 min-h-[50vh] lg:min-h-0">
             <ResultDisplay
                isLoading={isLoading}
                generatedImage={generatedImage}
                generatedText={generatedText}
             />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;