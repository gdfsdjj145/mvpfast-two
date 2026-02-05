/**
 * Cloudflare R2 存储服务
 *
 * @module @/lib/services/storage
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { serverEnv } from '../config/env';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const PREFIX_MAP: Record<string, string> = {
  post: 'posts',
  avatar: 'avatars',
  general: 'uploads',
};

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: serverEnv.R2_ENDPOINT!,
      credentials: {
        accessKeyId: serverEnv.R2_ACCESS_KEY_ID!,
        secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

export function validateFile(
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${contentType}，仅支持 JPG/PNG/GIF/WebP/SVG`,
    };
  }
  if (size > MAX_SIZE) {
    return {
      valid: false,
      error: `文件大小超过限制: ${(size / 1024 / 1024).toFixed(1)}MB，最大 5MB`,
    };
  }
  return { valid: true };
}

export function generateKey(type: string, contentType: string): string {
  const prefix = PREFIX_MAP[type] || PREFIX_MAP.general;
  const ext = EXT_MAP[contentType] || 'bin';
  const timestamp = Date.now();
  const id = nanoid(10);
  return `${prefix}/${timestamp}-${id}.${ext}`;
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: serverEnv.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const domain = serverEnv.R2_PUBLIC_DOMAIN!.replace(/\/$/, '');
  return `${domain}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: serverEnv.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

export function getKeyFromUrl(url: string): string | null {
  const domain = serverEnv.R2_PUBLIC_DOMAIN!.replace(/\/$/, '');
  if (!url.startsWith(domain)) return null;
  return url.slice(domain.length + 1);
}
