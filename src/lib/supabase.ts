import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 请求 OTP
export async function requestOTP(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}

// 验证 OTP
export async function verifyOTP(email, otp) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });
  console.log(data, error);
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}

export const uploadFile = async (
  file: File,
  bucket: string,
  userId?: string
) => {
  try {
    // 生成文件路径
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    // 使用用户ID组织文件路径
    const filePath = userId ? `users/${userId}/${fileName}` : `${fileName}`;

    // 上传文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // 不覆盖现有文件
      });

    if (error) throw error;

    // 获取文件的公共URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteFile = async (path: string, bucket: string) => {
  const { data, error } = await supabase.storage.from(bucket).remove([path]);
};

// 下载文件
export const downloadFile = async (path: string, bucket: string) => {
  const { data, error } = await supabase.storage.from(bucket).download(path);
};

// 列出文件
export const listFiles = async (bucket: string) => {
  const { data, error } = await supabase.storage.from(bucket).list();
  return data;
};
