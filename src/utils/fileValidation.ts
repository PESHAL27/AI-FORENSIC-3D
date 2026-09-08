import type { EvidenceUploadType } from '../types/investigation';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  inferredType?: 'image' | 'video' | '360-image' | 'report' | 'measurements';
}

export const ALLOWED_EXTENSIONS = {
  image: ['png', 'jpg', 'jpeg', 'webp'],
  '360-image': ['png', 'jpg', 'jpeg', 'webp', 'exr', 'hdr'],
  video: ['mp4', 'webm', 'mov'],
  report: ['pdf', 'docx', 'doc', 'txt', 'json'],
  measurements: ['csv', 'json', 'txt', 'las', 'laz', 'e57', 'xyz'],
};

export const MAX_FILE_SIZES: Record<string, number> = {
  image: 25 * 1024 * 1024, // 25 MB
  '360-image': 50 * 1024 * 1024, // 50 MB
  video: 100 * 1024 * 1024, // 100 MB
  report: 20 * 1024 * 1024, // 20 MB
  measurements: 50 * 1024 * 1024, // 50 MB
};

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function validateEvidenceFile(
  file: File,
  expectedUploadType: EvidenceUploadType,
  existingFilenames: string[] = []
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'Ingestion Error: No file provided for upload.' };
  }

  // 1. Check empty file
  if (file.size === 0) {
    return { valid: false, error: `Invalid Artifact: File "${file.name}" is 0 bytes (empty payload).` };
  }

  const ext = getFileExtension(file.name);

  // 2. Check duplicate filename in case
  if (existingFilenames.includes(file.name)) {
    return {
      valid: false,
      error: `Duplicate Evidence: An artifact named "${file.name}" is already registered in this case repository.`,
    };
  }

  // Determine category
  const targetCategory =
    expectedUploadType === 'multi-image' ? 'image' : (expectedUploadType as keyof typeof ALLOWED_EXTENSIONS);

  const allowedList = ALLOWED_EXTENSIONS[targetCategory];
  if (!allowedList) {
    return { valid: true, inferredType: 'report' };
  }

  // 3. Extension verification
  if (!allowedList.includes(ext)) {
    return {
      valid: false,
      error: `Format Rejected: ".${ext}" is not supported for ${expectedUploadType.toUpperCase()} ingestion. Supported: [${allowedList.map((e) => `.${e}`).join(', ')}]`,
    };
  }

  // 4. Size validation
  const maxAllowed = MAX_FILE_SIZES[targetCategory] || 30 * 1024 * 1024;
  if (file.size > maxAllowed) {
    return {
      valid: false,
      error: `Payload Exceeded: File size (${formatBytes(file.size)}) exceeds forensic buffer limit of ${formatBytes(maxAllowed)}.`,
    };
  }

  // Infer high-level category
  let inferred: 'image' | 'video' | '360-image' | 'report' | 'measurements' = 'image';
  if (targetCategory === 'video') inferred = 'video';
  else if (targetCategory === '360-image') inferred = '360-image';
  else if (targetCategory === 'report') inferred = 'report';
  else if (targetCategory === 'measurements') inferred = 'measurements';

  return { valid: true, inferredType: inferred };
}
