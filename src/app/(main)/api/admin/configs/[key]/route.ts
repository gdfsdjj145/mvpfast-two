import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getClientInfo } from '@/lib/auth-utils';
import { getConfigByKey, deleteConfig } from '@/models/systemConfig';
import { getAuditLogsByKey, createAuditLog } from '@/models/configAuditLog';
import { clearConfigCache } from '@/lib/config-service';

type RouteParams = {
  params: Promise<{ key: string }>;
};

// GET /api/admin/configs/[key] - 获取单个配置详情（包含审计日志）
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    // 获取配置
    const config = await getConfigByKey(key);

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // 获取最近 10 条审计日志
    const auditLogs = await getAuditLogsByKey(key, {
      skip: 0,
      take: 10,
    });

    return NextResponse.json({
      config,
      auditLogs: auditLogs.items,
      auditLogsCount: auditLogs.count,
    });
  } catch (error: any) {
    console.error('[API] GET /api/admin/configs/[key] error:', error);

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

// DELETE /api/admin/configs/[key] - 删除配置（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 验证管理员权限
    const admin = await requireAdmin();

    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    // 获取旧值（用于审计）
    const oldConfig = await getConfigByKey(key);

    if (!oldConfig) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // 软删除配置
    await deleteConfig(key, admin.id);

    // 创建审计日志
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      configKey: key,
      oldValue: oldConfig.value,
      newValue: null,
      changedBy: admin.id,
      changedByEmail: admin.email || admin.phone || undefined,
      action: 'delete',
      ipAddress,
      userAgent,
    });

    // 清除缓存
    clearConfigCache();

    return NextResponse.json({
      success: true,
      message: 'Config deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] DELETE /api/admin/configs/[key] error:', error);

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
