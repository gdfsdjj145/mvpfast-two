'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  type?: string;
  variant?: 'default' | 'avatar';
  disabled?: boolean;
}

async function uploadFile(
  file: File,
  type: string
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/upload?type=${type}`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '上传失败');
  }
  return data;
}

export default function ImageUpload({
  value,
  onChange,
  type = 'general',
  variant = 'default',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled || uploading) return;
      setUploading(true);
      try {
        const { url } = await uploadFile(file, type);
        onChange(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '上传失败';
        // Use console.error as fallback; parent can handle toast
        console.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [disabled, uploading, type, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  if (variant === 'avatar') {
    return (
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-base-300 hover:border-primary transition-colors relative"
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <span className="loading loading-spinner loading-md" />
          ) : value ? (
            <img
              src={value}
              alt="头像"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={32} className="text-base-content/30" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload size={14} />
            上传头像
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-sm btn-ghost text-error"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X size={14} />
              移除
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // Default variant: rectangular drop zone
  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-base-300 hover:border-primary/50'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="loading loading-spinner loading-md" />
            <span className="text-sm text-base-content/60">上传中...</span>
          </div>
        ) : value ? (
          <div className="relative group">
            <img
              src={value}
              alt="预览"
              className="max-h-40 mx-auto rounded"
            />
            <button
              type="button"
              className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <Upload size={24} className="text-base-content/30" />
            <span className="text-sm text-base-content/60">
              点击或拖拽上传图片
            </span>
            <span className="text-xs text-base-content/40">
              支持 JPG/PNG/GIF/WebP/SVG，最大 5MB
            </span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

/**
 * Helper for uploading image files programmatically (e.g. from MDEditor paste/drop).
 * Returns the public URL or null on failure.
 */
export async function uploadImageFile(
  file: File,
  type = 'post'
): Promise<string | null> {
  try {
    const { url } = await uploadFile(file, type);
    return url;
  } catch {
    return null;
  }
}
