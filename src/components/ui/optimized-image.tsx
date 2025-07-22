import React, { useState, useEffect, useRef } from 'react';
import { 
  getOptimizedImageUrl, 
  getThumbnailUrl, 
  getPreviewUrl, 
  getFullImageUrl,
  getSrcSet,
  getSizes,
  preloadImage,
  isMobileDevice
} from '@/lib/cdnUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  format = 'webp',
  fit = 'cover',
  crop = 'center',
  lazy = true,
  placeholder,
  onLoad,
  onError,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Configurar intersection observer para lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Carregar 50px antes de entrar na viewport
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  // Por enquanto, usar a URL original diretamente
  const finalSrc = src;

  // Preload da imagem quando entrar na viewport
  useEffect(() => {
    if (isInView && finalSrc) {
      preloadImage(finalSrc)
        .then(() => {
          setIsLoaded(true);
          onLoad?.();
        })
        .catch(() => {
          setIsError(true);
          onError?.();
        });
    }
  }, [isInView, finalSrc, onLoad, onError]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: '4/5' }}
    >
      {/* Placeholder/loading */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt="Loading..." 
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={isInView ? finalSrc : ''}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setIsError(true);
          onError?.();
        }}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default'
        }}
      />

      {/* Overlay de erro */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">Erro ao carregar imagem</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para imagem responsiva com diferentes tamanhos
export const ResponsiveImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
    />
  );
};

// Componente para imagem com lazy loading otimizado
export const LazyImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      lazy={true}
    />
  );
}; 