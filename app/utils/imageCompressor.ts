/**
 * Утиліта для клієнтського стиснення та конвертації зображень у WebP.
 * Зменшує розмір важких мобільних фото (з 8-15 МБ до 200-400 КБ),
 * зберігаючи високу чіткість (Full HD / 1920px) для покупців та аналізу ШІ.
 */
export const compressImageToWebP = async (
  file: File,
  maxWidth = 1920,
  quality = 0.85
): Promise<File> => {
  // Якщо це не растрове зображення (наприклад SVG або документ), повертаємо як є
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Пропорційно зменшуємо роздільну здатність, якщо фото більше за maxWidth
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертуємо у WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const webpName = `${originalNameWithoutExt}.webp`;

          const webpFile = new File([blob], webpName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
};
