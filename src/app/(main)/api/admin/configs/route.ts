import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getClientInfo } from '@/lib/auth/utils';
import { getConfigs, upsertConfig } from '@/models/systemConfig';
import { createAuditLog } from '@/models/configAuditLog';
import { clearConfigCache } from '@/lib/config/service';
import { getConfigByKey } from '@/models/systemConfig';

// GET /api/admin/configs - 获取配置列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await getConfigs({
      skip,
      take,
      category,
      search,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] GET /api/admin/configs error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/configs - 创建或更新配置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const admin = await requireAdmin();

    const body = await request.json();
    const { key, value, type, category, description } = body;

    // 验证必填字段
    if (!key || value === undefined || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value, type, category' },
        { status: 400 }
      );
    }

    // 获取旧值（用于审计）
    const oldConfig = await getConfigByKey(key);

    // 创建或更新配置
    const updatedConfig = await upsertConfig(
      {
        key,
        value,
        type,
        category,
        description,
        isActive: true,
      },
      admin.id
    );

    // 创建审计日志
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      configKey: key,
      oldValue: oldConfig?.value,
      newValue: value,
      changedBy: admin.id,
      changedByEmail: admin.email || admin.phone || undefined,
      action: oldConfig ? 'update' : 'create',
      ipAddress,
      userAgent,
    });

    // 清除缓存
    clearConfigCache();

    return NextResponse.json({
      success: true,
      data: updatedConfig,
    });
  } catch (error: any) {
    console.error('[API] POST /api/admin/configs error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
