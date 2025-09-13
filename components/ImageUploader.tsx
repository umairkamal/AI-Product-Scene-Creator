
import React, { useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  onImageSelect: (file: File, previewUrl: string) => void;
  previewUrl?: string | null;
  onClear?: () => void;
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageSelect, previewUrl, onClear, multiple = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onImageSelect(file, reader.result);
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset input value to allow re-uploading the same file
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label className="text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div
        onClick={handleContainerClick}
        className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-800 transition-colors relative group"
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          multiple={multiple}
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" />
            {onClear && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Clear image"
                >
                    X
                </button>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
            <p>Click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};
