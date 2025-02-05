import React, { useState } from 'react';
import { uploadFile } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  defaultImage?: string;
  bucket?: string;
  className?: string;
  userId?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  defaultImage,
  bucket = 'avatars',
  className = 'w-32 h-32',
  userId,
}) => {
  const [preview, setPreview] = useState<string | null>(() => {
    if (defaultImage && defaultImage.trim() !== '') {
      return defaultImage;
    }
    return null;
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }

      // 验证文件大小（例如：2MB）
      if (file.size > 2 * 1024 * 1024) {
        toast.error('图片大小不能超过2MB');
        return;
      }

      setUploading(true);

      // 上传到 Supabase
      const publicUrl = await uploadFile(file, bucket, userId);
      if (!publicUrl) {
        throw new Error('上传失败');
      }

      // 创建本地预览
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      onUploadComplete?.(publicUrl);
      toast.success('上传成功！');
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div
        className={`relative border-2 border-dashed border-gray-300 overflow-hidden ${className}`}
      >
        {preview ? (
          <Image src={preview} alt="预览图" fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-gray-400">点击上传图片</span>
          </div>
        )}

        {/* 悬停效果 */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm">更换图片</span>
        </div>

        {/* 文件输入 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </div>

      {/* 上传状态 */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-sm text-gray-600">上传中...</div>
        </div>
      )}
    </div>
  );
};
