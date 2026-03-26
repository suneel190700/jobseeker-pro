import mammoth from 'mammoth';

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractFromPDF(buffer);
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDOCX(buffer);
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues with pdf-parse in edge runtime
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function validateResumeFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please upload a PDF, DOCX, or TXT file.';
  }

  if (file.size > MAX_SIZE) {
    return 'File must be under 10MB.';
  }

  return null;
}
