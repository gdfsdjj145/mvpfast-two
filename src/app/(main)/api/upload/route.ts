import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isR2Configured } from '@/lib/config/env';
import { validateFile, generateKey, uploadToR2 } from '@/lib/services/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'R2 存储未配置，请联系管理员' },
        { status: 503 }
      );
    }

    const type =
      request.nextUrl.searchParams.get('type') || 'general';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      );
    }

    const validation = validateFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateKey(type, file.type);
    const url = await uploadToR2(buffer, key, file.type);

    return NextResponse.json({ success: true, url, key });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { error: '上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
