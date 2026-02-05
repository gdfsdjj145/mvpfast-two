import { NextRequest, NextResponse } from 'next/server';
import { executeInit, isSystemInitialized } from '@/lib/init';

export async function POST(request: NextRequest) {
  try {
    // 自锁检查
    const initialized = await isSystemInitialized();
    if (initialized) {
      return NextResponse.json(
        { success: false, error: '系统已初始化' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectName, adminEmail, adminPassword, locale, domain } = body;

    // 参数校验
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'projectName 为必填项' },
        { status: 400 }
      );
    }

    if (projectName.length > 30) {
      return NextResponse.json(
        { success: false, error: 'projectName 不能超过 30 个字符' },
        { status: 400 }
      );
    }

    if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return NextResponse.json(
        { success: false, error: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }

    if (!adminPassword || adminPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度不能少于 6 位' },
        { status: 400 }
      );
    }

    if (locale && !['zh', 'en'].includes(locale)) {
      return NextResponse.json(
        { success: false, error: 'locale 仅支持 zh 或 en' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 执行初始化
    const result = await executeInit(
      { projectName, adminEmail, adminPassword, locale, domain },
      { ipAddress, userAgent }
    );

    return NextResponse.json({
      success: true,
      data: {
        admin: result.admin,
        configs: result.configs,
        message: '初始化完成',
      },
    });
  } catch (error: any) {
    console.error('[Init API] Error:', error);

    if (error.message === 'ALREADY_INITIALIZED') {
      return NextResponse.json(
        { success: false, error: '系统已初始化' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || '初始化失败' },
      { status: 500 }
    );
  }
}
