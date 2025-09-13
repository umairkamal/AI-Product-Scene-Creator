import React from 'react';
import { Spinner } from './Spinner';

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  generatedText: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, generatedImage, generatedText }) => {
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-product-scene-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400">
        <div className="flex justify-center items-center mb-4">
            <Spinner />
        </div>
        <p className="text-lg font-semibold">Generating your scene...</p>
        <p className="text-sm">The AI is thinking. This may take a moment.</p>
      </div>
    );
  }

  if (generatedImage) {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        <img src={generatedImage} alt="Generated scene" className="w-full max-w-full rounded-lg shadow-2xl shadow-black/50" />
        
        <button
          onClick={handleDownload}
          className="mt-2 flex items-center justify-center gap-2 py-2 px-5 text-md font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105"
          aria-label="Download generated image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        {generatedText && <p className="text-gray-300 bg-gray-900/50 p-3 rounded-md w-full text-center">{generatedText}</p>}
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="mt-4 text-lg font-medium">Your generated image will appear here.</p>
      <p className="text-sm">Complete the steps on the left to begin.</p>
    </div>
  );
};
