import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadedFileValidation {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  mimeType?: string;
}

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes checks for PDF, JPEG, PNG
export function validateFileMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (buffer.length < 4) return { valid: false };

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: 'application/pdf' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 0x89 0x50 0x4E 0x47 (0x89 'P' 'N' 'G')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  return { valid: false };
}

export function validateDocumentFile(
  filename: string,
  buffer: Buffer,
  declaredMimeType?: string
): UploadedFileValidation {
  // 1. File size check
  if (buffer.length > MAX_DOCUMENT_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds maximum permitted limit (10MB).' };
  }

  if (buffer.length === 0) {
    return { valid: false, error: 'Cannot upload empty file.' };
  }

  // 2. Extension check
  const ext = path.extname(filename).toLowerCase();
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
  if (!allowedExts.includes(ext)) {
    return { valid: false, error: 'Invalid file extension. Only PDF, JPG, and PNG are permitted.' };
  }

  // 3. Magic bytes / signature check
  const magic = validateFileMagicBytes(buffer);
  if (!magic.valid) {
    return {
      valid: false,
      error: 'File signature verification failed. Content does not match a valid PDF, JPEG, or PNG format.',
    };
  }

  return {
    valid: true,
    sanitizedName: path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_'),
    mimeType: magic.detectedMime,
  };
}

export interface DocumentStorageProvider {
  providerName: string;
  saveDocument(fileKey: string, buffer: Buffer, mimeType?: string): Promise<string>;
  readDocument(fileKey: string): Promise<Buffer | null>;
  generateSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
  deleteDocument(fileKey: string): Promise<boolean>;
}

/**
 * Local Private Storage for Development
 * Stores documents completely outside the public web root in a secure isolated storage directory.
 */
export class LocalPrivateDocumentStorage implements DocumentStorageProvider {
  public providerName = 'LOCAL';
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'storage', 'private_documents');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (e) {
        // Fallback to /tmp on serverless read-only filesystem
        this.baseDir = path.join('/tmp', 'vahanloop_storage');
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    }
  }

  async saveDocument(fileKey: string, buffer: Buffer): Promise<string> {
    const targetPath = path.join(this.baseDir, fileKey);
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(targetPath, buffer);
    return fileKey;
  }

  async readDocument(fileKey: string): Promise<Buffer | null> {
    const targetPath = path.join(this.baseDir, fileKey);
    if (!fs.existsSync(targetPath)) return null;
    return fs.readFileSync(targetPath);
  }

  async generateSignedUrl(fileKey: string, expiresInSeconds: number = 300): Promise<string> {
    // Generate secure temporary signature token
    const secret = process.env.JWT_SECRET || 'vahanloop_secret_vault';
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto
      .createHmac('sha256', secret)
      .update(`${fileKey}:${expires}`)
      .digest('hex');

    return `/api/documents/download/${encodeURIComponent(fileKey)}?token=${token}&expires=${expires}`;
  }

  async deleteDocument(fileKey: string): Promise<boolean> {
    const targetPath = path.join(this.baseDir, fileKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
    return false;
  }
}

/**
 * S3-Compatible Managed Cloud Storage
 * Supports AWS S3, Cloudflare R2, MinIO, or Supabase Storage with presigned URLs.
 */
export class S3CompatibleDocumentStorage implements DocumentStorageProvider {
  public providerName = 'S3';
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME || '';
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'ap-south-1';
    const endpoint = process.env.S3_ENDPOINT; // e.g. for Cloudflare R2: https://<id>.r2.cloudflarestorage.com
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: Boolean(endpoint && endpoint.includes('localhost')),
    });
  }

  async saveDocument(fileKey: string, buffer: Buffer, mimeType: string = 'application/octet-stream'): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
    });
    await this.client.send(command);
    return fileKey;
  }

  async readDocument(fileKey: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });
      const response = await this.client.send(command);
      if (!response.Body) return null;
      const byteArray = await response.Body.transformToByteArray();
      return Buffer.from(byteArray);
    } catch (e) {
      console.error(`S3 read error for key ${fileKey}:`, e);
      return null;
    }
  }

  async generateSignedUrl(fileKey: string, expiresInSeconds: number = 300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteDocument(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });
      await this.client.send(command);
      return true;
    } catch (e) {
      console.error(`S3 delete error for key ${fileKey}:`, e);
      return false;
    }
  }
}

/**
 * Storage Provider Factory
 */
export function getDocumentStorage(): DocumentStorageProvider {
  const bucket = process.env.S3_BUCKET_NAME;
  const accessKey = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (bucket && accessKey && secretKey) {
    try {
      return new S3CompatibleDocumentStorage();
    } catch (err) {
      console.warn('Failed to initialize S3 storage, falling back to local private storage:', err);
      return new LocalPrivateDocumentStorage();
    }
  }

  return new LocalPrivateDocumentStorage();
}

export const documentStorage: DocumentStorageProvider = getDocumentStorage();
