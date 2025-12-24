/**
 * 环境变量校验和类型安全访问
 *
 * 使用 Zod 验证环境变量，确保启动时检查必要配置
 */

import { z } from 'zod';

/**
 * 服务器端环境变量 Schema
 */
const serverEnvSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().min(1, '数据库连接字符串不能为空'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth 密钥不能为空'),
  NEXTAUTH_URL: z.string().url('NextAuth URL 必须是有效的 URL').optional(),
  NEXTAUTH_SALT: z.string().optional(),

  // 微信支付
  WECHAT_MCHID: z.string().optional(),
  WECHAT_SERIAL_NO: z.string().optional(),
  WECHAT_PRIVATE_KEY: z.string().optional(),

  // 阿里云短信
  ALIYUN_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_ACCESS_KEY_SECRET: z.string().optional(),
  ALIYUN_SMS_SIGN_NAME: z.string().optional(),
  ALIYUN_SMS_TEMPLATE_CODE: z.string().optional(),

  // 邮件
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.string().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),

  // Node 环境
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * 客户端环境变量 Schema (NEXT_PUBLIC_ 前缀)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('API URL 必须是有效的 URL').optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url('网站 URL 必须是有效的 URL').optional(),
  NEXT_PUBLIC_WECHAT_APPID: z.string().optional(),
  NEXT_PUBLIC_YUNGOUOS_MCH_ID: z.string().optional(),
  NEXT_PUBLIC_YUNGOUOS_API_KEY: z.string().optional(),
});

/**
 * 服务器端环境变量类型
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * 客户端环境变量类型
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * 验证服务器端环境变量
 */
function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n');

    console.error('❌ 服务器端环境变量校验失败:\n' + errorMessages);

    // 在开发环境抛出错误，生产环境只警告
    if (process.env.NODE_ENV === 'development') {
      throw new Error('环境变量校验失败，请检查 .env 文件配置');
    }
  }

  return parsed.data as ServerEnv;
}

/**
 * 验证客户端环境变量
 */
function validateClientEnv(): ClientEnv {
  const clientEnvData = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_WECHAT_APPID: process.env.NEXT_PUBLIC_WECHAT_APPID,
    NEXT_PUBLIC_YUNGOUOS_MCH_ID: process.env.NEXT_PUBLIC_YUNGOUOS_MCH_ID,
    NEXT_PUBLIC_YUNGOUOS_API_KEY: process.env.NEXT_PUBLIC_YUNGOUOS_API_KEY,
  };

  const parsed = clientEnvSchema.safeParse(clientEnvData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n');

    console.warn('⚠️ 客户端环境变量校验警告:\n' + errorMessages);
  }

  return parsed.data as ClientEnv;
}

/**
 * 服务器端环境变量 (只在服务器端使用)
 *
 * @example
 * ```ts
 * import { serverEnv } from '@/lib/env';
 *
 * const dbUrl = serverEnv.DATABASE_URL;
 * ```
 */
export const serverEnv: ServerEnv = validateServerEnv();

/**
 * 客户端环境变量 (可在客户端和服务器端使用)
 *
 * @example
 * ```ts
 * import { clientEnv } from '@/lib/env';
 *
 * const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;
 * ```
 */
export const clientEnv: ClientEnv = validateClientEnv();

/**
 * 检查是否为开发环境
 */
export const isDevelopment = serverEnv.NODE_ENV === 'development';

/**
 * 检查是否为生产环境
 */
export const isProduction = serverEnv.NODE_ENV === 'production';

/**
 * 检查是否为测试环境
 */
export const isTest = serverEnv.NODE_ENV === 'test';

/**
 * 检查微信支付是否已配置
 */
export function isWechatPayConfigured(): boolean {
  return !!(
    serverEnv.WECHAT_MCHID &&
    serverEnv.WECHAT_SERIAL_NO &&
    serverEnv.WECHAT_PRIVATE_KEY &&
    clientEnv.NEXT_PUBLIC_WECHAT_APPID
  );
}

/**
 * 检查云购支付是否已配置
 */
export function isYungouPayConfigured(): boolean {
  return !!(
    clientEnv.NEXT_PUBLIC_YUNGOUOS_MCH_ID &&
    clientEnv.NEXT_PUBLIC_YUNGOUOS_API_KEY
  );
}

/**
 * 检查阿里云短信是否已配置
 */
export function isSmsConfigured(): boolean {
  return !!(
    serverEnv.ALIYUN_ACCESS_KEY_ID &&
    serverEnv.ALIYUN_ACCESS_KEY_SECRET &&
    serverEnv.ALIYUN_SMS_SIGN_NAME &&
    serverEnv.ALIYUN_SMS_TEMPLATE_CODE
  );
}

/**
 * 检查邮件服务是否已配置
 */
export function isEmailConfigured(): boolean {
  return !!(
    serverEnv.MAIL_HOST &&
    serverEnv.MAIL_PORT &&
    serverEnv.MAIL_USER &&
    serverEnv.MAIL_PASS
  );
}

/**
 * 获取必需的环境变量，如果不存在则抛出错误
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`缺少必需的环境变量: ${key}`);
  }
  return value;
}

/**
 * 获取可选的环境变量，不存在则返回默认值
 */
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}
