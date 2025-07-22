import { supabase } from './supabase';

export interface CDNOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Gera URL otimizada do CDN com parâmetros de transformação
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: CDNOptions = {}
): string => {
  if (!originalUrl) return originalUrl;

  // Por enquanto, retornar a URL original
  // TODO: Implementar transformações quando o CDN estiver configurado
  console.log('URL original:', originalUrl);
  return originalUrl;
};

/**
 * Gera URL para thumbnail (versão pequena da imagem)
 */
export const getThumbnailUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, {
    width: 300,
    height: 375, // 4:5 aspect ratio
    quality: 70,
    format: 'webp'
  });
};

/**
 * Gera URL para preview (versão média da imagem)
 */
export const getPreviewUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, {
    width: 600,
    height: 750, // 4:5 aspect ratio
    quality: 80,
    format: 'webp'
  });
};

/**
 * Gera URL para imagem completa (alta qualidade)
 */
export const getFullImageUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, {
    width: 1200,
    height: 1500, // 4:5 aspect ratio
    quality: 90,
    format: 'webp'
  });
};

/**
 * Detecta se o navegador suporta WebP
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Obtém o formato ideal baseado no suporte do navegador
 */
export const getOptimalFormat = (): 'webp' | 'jpeg' => {
  return supportsWebP() ? 'webp' : 'jpeg';
};

/**
 * Gera URL otimizada baseada no dispositivo e conexão
 */
export const getAdaptiveImageUrl = (
  originalUrl: string,
  deviceType: 'mobile' | 'desktop' = 'desktop'
): string => {
  const format = getOptimalFormat();
  
  if (deviceType === 'mobile') {
    return getOptimizedImageUrl(originalUrl, {
      width: 400,
      height: 500,
      quality: 75,
      format
    });
  } else {
    return getOptimizedImageUrl(originalUrl, {
      width: 800,
      height: 1000,
      quality: 85,
      format
    });
  }
};

/**
 * Detecta se é dispositivo mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Gera URL com lazy loading otimizada
 */
export const getLazyLoadUrl = (originalUrl: string): string => {
  const deviceType = isMobileDevice() ? 'mobile' : 'desktop';
  return getAdaptiveImageUrl(originalUrl, deviceType);
};

/**
 * Preload de imagem para melhor performance
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to preload image'));
    img.src = url;
  });
};

/**
 * Gera múltiplas URLs para diferentes tamanhos (srcset)
 */
export const getSrcSet = (originalUrl: string): string => {
  const sizes = [
    { width: 300, height: 375 },
    { width: 600, height: 750 },
    { width: 800, height: 1000 },
    { width: 1200, height: 1500 }
  ];

  return sizes
    .map(size => {
      const url = getOptimizedImageUrl(originalUrl, {
        width: size.width,
        height: size.height,
        quality: 80,
        format: getOptimalFormat()
      });
      return `${url} ${size.width}w`;
    })
    .join(', ');
};

/**
 * Gera sizes attribute para responsive images
 */
export const getSizes = (): string => {
  return '(max-width: 640px) 300px, (max-width: 1024px) 600px, 800px';
}; 