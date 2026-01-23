
/**
 * Utilitário para processamento de imagens Client-Side.
 * Essencial para o Firebase RTDB que tem limite de tamanho por nó.
 */
export const ImageUtils = {
  compress: (file: File, maxWidth = 600, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas context failed');
            return;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Retorna JPEG comprimido
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
};
