import * as pdfjsLib from 'pdfjs-dist';
import { SheetType, UploadedFile } from '../types';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export async function analyzeUploadedFile(file: File): Promise<UploadedFile> {
  const id = 'file_' + Math.random().toString(36).substring(2, 9);
  const name = file.name;
  const size = file.size;
  const type = file.type;

  let pageCount = 1;
  let width: number | undefined;
  let height: number | undefined;
  let suggestedSheetType: SheetType = 'A4';
  let previewUrl: string | undefined;

  // Generate Base64 Data URL for preview and storing
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.readAsDataURL(file);
  });

  try {
    if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
      // PDF File Analysis
      try {
        const loadingTask = pdfjsLib.getDocument({ data: atob(dataUrl.split(',')[1]) });
        const pdfDoc = await loadingTask.promise;
        pageCount = pdfDoc.numPages;
      } catch {
        // Fallback PDF page count via regex in binary string
        const binary = atob(dataUrl.split(',')[1] || '');
        const matches = binary.match(/\/Count\s+(\d+)/g);
        if (matches && matches.length > 0) {
          const counts = matches.map(m => parseInt(m.replace(/\/Count\s+/, ''), 10));
          pageCount = Math.max(...counts, 1);
        } else {
          pageCount = 1;
        }
      }
      suggestedSheetType = 'A4';
      previewUrl = dataUrl;
    } else if (type.startsWith('image/')) {
      // Image File Analysis
      previewUrl = dataUrl;
      const imgDimensions = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.onerror = () => resolve({ w: 800, h: 1000 });
        img.src = dataUrl;
      });

      width = imgDimensions.w;
      height = imgDimensions.h;
      pageCount = 1;

      // Predictive logic: If image width or height > 2000px, recommend A3 or Poster
      if (width > 2500 || height > 2500) {
        suggestedSheetType = 'Poster';
      } else if (width > 1800 || height > 1800) {
        suggestedSheetType = 'A3';
      } else {
        suggestedSheetType = 'A4';
      }
    } else {
      // Text or Doc
      pageCount = Math.max(1, Math.ceil(size / 3000)); // Approx 3KB per page
      suggestedSheetType = 'A4';
    }
  } catch (err) {
    console.warn('File analysis warning:', err);
    pageCount = 1;
  }

  // Truncate huge dataUrls if over 300KB to prevent localStorage QuotaExceededError
  const storedDataUrl = dataUrl.length > 300000 ? dataUrl.substring(0, 300000) : dataUrl;

  return {
    id,
    name,
    size,
    type,
    dataUrl: storedDataUrl,
    previewUrl: storedDataUrl,
    pageCount,
    width,
    height,
    suggestedSheetType,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
