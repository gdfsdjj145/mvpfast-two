/**
 * 项目初始化服务
 *
 * @module @/lib/init/service
 */

import prisma from '@/lib/core/prisma';
import bcrypt from 'bcryptjs';
import { upsertConfig } from '@/models/systemConfig';
import { getConfigByKey } from '@/models/systemConfig';
import { createAuditLog } from '@/models/configAuditLog';
import { clearConfigCache } from '@/lib/config/service';
import { grantInitialCredits } from '@/models/credit';
import { getGeneratorName } from '@/lib/utils/name-generator';

export interface InitParams {
  projectName: string;
  adminEmail: string;
  adminPassword: string;
  locale?: string;
  domain?: string;
}

export interface InitResult {
  admin: { id: string; email: string; role: string };
  configs: string[];
}

/**
 * 检查系统是否已初始化
 */
export async function isSystemInitialized(): Promise<boolean> {
  const config = await getConfigByKey('system.initialized');
  return config?.value === true;
}

/**
 * 创建或提升管理员账号
 */
async function createBootstrapAdmin(params: {
  email: string;
  password: string;
}): Promise<{ id: string; email: string; role: string; isNew: boolean }> {
  const hashedPassword = await bcrypt.hash(params.password, 10);

  const existingUser = await prisma.user.findFirst({
    where: { email: params.email },
  });

  if (existingUser) {
    // 已存在 → 提升为 admin，更新密码
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: 'admin',
        password: hashedPassword,
      },
    });
    return {
      id: updated.id,
      email: updated.email!,
      role: updated.role,
      isNew: false,
    };
  }

  // 不存在 → 创建新用户
  const newUser = await prisma.user.create({
    data: {
      email: params.email,
      password: hashedPassword,
      role: 'admin',
      nickName: getGeneratorName(),
    },
  });

  return {
    id: newUser.id,
    email: newUser.email!,
    role: newUser.role,
    isNew: true,
  };
}

/**
 * 初始化系统配置
 */
async function initSystemConfig(params: {
  projectName: string;
  locale: string;
  domain: string;
  adminId: string;
}): Promise<string[]> {
  const configs = [
    // 系统配置
    {
      key: 'system.siteName',
      value: params.projectName,
      type: 'string',
      category: 'system',
      description: '站点名称',
    },
    {
      key: 'system.domain',
      value: params.domain,
      type: 'string',
      category: 'system',
      description: '站点域名',
    },
    {
      key: 'system.initialized',
      value: true,
      type: 'boolean',
      category: 'system',
      description: '系统是否已初始化',
    },
    {
      key: 'system.initAt',
      value: new Date().toISOString(),
      type: 'string',
      category: 'system',
      description: '初始化时间',
    },
    {
      key: 'system.initBy',
      value: 'ai_init',
      type: 'string',
      category: 'system',
      description: '初始化方式',
    },
    // 认证配置（默认密码登录）
    {
      key: 'auth.loginType',
      value: 'password',
      type: 'string',
      category: 'auth',
      description: '当前登录方式',
    },
    {
      key: 'auth.loginTypes',
      value: ['password'],
      type: 'array',
      category: 'auth',
      description: '启用的登录方式列表',
    },
  ];

  // 并行写入配置，提升初始化速度
  await Promise.all(
    configs.map(config => upsertConfig(config, params.adminId))
  );

  return configs.map((c) => c.key);
}

/**
 * 写入审计日志
 */
async function writeAuditLog(params: {
  adminId: string;
  adminEmail: string;
  projectName: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await createAuditLog({
    configKey: 'system.initialized',
    action: 'create',
    newValue: {
      projectName: params.projectName,
      adminEmail: params.adminEmail,
      initMethod: 'ai_init',
      timestamp: new Date().toISOString(),
    },
    changedBy: params.adminId,
    changedByEmail: params.adminEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * 执行完整初始化流程
 */
export async function executeInit(
  params: InitParams,
  clientInfo?: { ipAddress?: string; userAgent?: string }
): Promise<InitResult> {
  // Step 1: 自锁守卫
  const initialized = await isSystemInitialized();
  if (initialized) {
    throw new Error('ALREADY_INITIALIZED');
  }

  // Step 2: 创建/提升管理员
  const admin = await createBootstrapAdmin({
    email: params.adminEmail,
    password: params.adminPassword,
  });

  // 新用户赠送初始积分
  if (admin.isNew) {
    await grantInitialCredits(admin.id);
  }

  // Step 3: 写入系统配置
  const configKeys = await initSystemConfig({
    projectName: params.projectName,
    locale: params.locale || 'zh',
    domain: params.domain || 'example.com',
    adminId: admin.id,
  });

  // Step 4: 写入审计日志
  await writeAuditLog({
    adminId: admin.id,
    adminEmail: admin.email,
    projectName: params.projectName,
    ipAddress: clientInfo?.ipAddress,
    userAgent: clientInfo?.userAgent,
  });

  // Step 5: 清除配置缓存
  clearConfigCache();

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
    configs: configKeys,
  };
}
