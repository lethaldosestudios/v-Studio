
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface OutputDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  isReadyToGenerate: boolean;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ generatedImage, isLoading, onGenerate, isReadyToGenerate }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">4. AI Generated Result</h2>
      <div className="flex-grow aspect-square bg-gray-100 dark:bg-gray-900/70 rounded-md flex items-center justify-center relative overflow-hidden border border-gray-200 dark:border-gray-700">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <SpinnerIcon className="w-12 h-12 text-white" />
            <p className="text-white mt-4 text-center">Generating your image...</p>
          </div>
        )}
        {generatedImage ? (
          <>
            <img src={generatedImage} alt="AI generated product" className="w-full h-full object-contain" />
            <a
              href={generatedImage}
              download="ai-product-photo.jpg"
              className="absolute bottom-4 right-4 bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <DownloadIcon className="w-5 h-5" />
              Download
            </a>
          </>
        ) : (
          !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              <p className="font-semibold">Your professional photo will appear here.</p>
              <p className="text-sm mt-1">Upload an image and click "Generate" to start.</p>
            </div>
          )
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading || !isReadyToGenerate}
        className="mt-6 w-full bg-brand-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-brand-blue-500 transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5" />
            Generating...
          </>
        ) : (
          "Generate Professional Photo"
        )}
      </button>
    </div>
  );
};
