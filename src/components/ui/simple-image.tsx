import React, { useState } from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const SimpleImage: React.FC<SimpleImageProps> = ({
  src,
  alt,
  className = '',
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ aspectRatio: '4/5' }}>
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">Sem imagem</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: '4/5' }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Imagem */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default'
        }}
      />

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm">Erro ao carregar imagem</p>
          </div>
        </div>
      )}
    </div>
  );
}; 