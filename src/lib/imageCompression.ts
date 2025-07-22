import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType?: string;
  quality?: number;
}

export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1, // Máximo 1MB após compressão
  maxWidthOrHeight: 1920, // Máxima dimensão
  useWebWorker: true,
  quality: 0.8, // Qualidade 80%
};

export const mobileCompressionOptions: CompressionOptions = {
  maxSizeMB: 0.5, // Máximo 500KB para mobile
  maxWidthOrHeight: 1080, // Resolução menor para mobile
  useWebWorker: true,
  quality: 0.7, // Qualidade 70% para mobile
};

/**
 * Comprime uma imagem antes do upload
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = defaultCompressionOptions
): Promise<File> => {
  try {
    console.log('Iniciando compressão:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      originalType: file.type,
      options
    });

    const compressedFile = await imageCompression(file, options);

    console.log('Compressão concluída:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
    });

    return compressedFile;
  } catch (error) {
    console.error('Erro na compressão:', error);
    // Se falhar, retorna o arquivo original
    return file;
  }
};

/**
 * Detecta se é dispositivo mobile para aplicar compressão mais agressiva
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Obtém as opções de compressão baseadas no dispositivo
 */
export const getCompressionOptions = (): CompressionOptions => {
  return isMobileDevice() ? mobileCompressionOptions : defaultCompressionOptions;
};

/**
 * Valida se o arquivo é uma imagem válida
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Verificar tipo
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Arquivo deve ser uma imagem' };
  }

  // Verificar tamanho (máximo 10MB antes da compressão)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Imagem muito grande (máximo 10MB)' };
  }

  // Verificar extensões permitidas
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de imagem não suportado' };
  }

  return { isValid: true };
};

/**
 * Redimensiona imagem para proporção 4:5 (Instagram-like)
 */
export const resizeToAspectRatio = async (
  file: File,
  targetRatio: number = 4/5
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const currentRatio = width / height;
      
      let newWidth, newHeight;
      
      if (currentRatio > targetRatio) {
        // Imagem é mais larga, cortar largura
        newHeight = height;
        newWidth = height * targetRatio;
      } else {
        // Imagem é mais alta, cortar altura
        newWidth = width;
        newHeight = width / targetRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Centralizar e cortar
      const offsetX = (width - newWidth) / 2;
      const offsetY = (height - newHeight) / 2;

      ctx.drawImage(
        img,
        offsetX, offsetY, newWidth, newHeight,
        0, 0, newWidth, newHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, file.type, 0.9);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Processa imagem completa: validação + redimensionamento + compressão
 */
export const processImageForUpload = async (file: File): Promise<File> => {
  // 1. Validar arquivo
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 2. Redimensionar para 4:5 se necessário
  let processedFile = await resizeToAspectRatio(file);

  // 3. Comprimir
  const options = getCompressionOptions();
  processedFile = await compressImage(processedFile, options);

  return processedFile;
}; 