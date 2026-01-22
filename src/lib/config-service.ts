import { getAllConfigsAsObject, getConfigByKey } from '@/models/systemConfig';
import { config as defaultConfig } from '@/config';

// 缓存相关
type ConfigCache = {
  data: Record<string, any>;
  timestamp: number;
};

let configCache: ConfigCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 清除配置缓存
 * 在配置更新后调用
 */
export function clearConfigCache() {
  configCache = null;
  console.log('[ConfigService] Cache cleared');
}

/**
 * 从数据库加载所有配置
 */
async function loadConfigsFromDb(): Promise<Record<string, any>> {
  try {
    const dbConfigs = await getAllConfigsAsObject();
    console.log('[ConfigService] Loaded configs from DB:', Object.keys(dbConfigs));
    return dbConfigs;
  } catch (error) {
    console.error('[ConfigService] Failed to load configs from DB:', error);
    return {};
  }
}

/**
 * 获取所有配置（带缓存）
 */
export async function getAllConfigs(): Promise<Record<string, any>> {
  const now = Date.now();

  // 检查缓存是否有效
  if (configCache && now - configCache.timestamp < CACHE_TTL) {
    console.log('[ConfigService] Using cached configs');
    return configCache.data;
  }

  // 从数据库加载配置
  const dbConfigs = await loadConfigsFromDb();

  // 与默认值合并（数据库配置优先）
  const mergedConfigs = {
    ...flattenDefaultConfig(),
    ...dbConfigs,
  };

  // 更新缓存
  configCache = {
    data: mergedConfigs,
    timestamp: now,
  };

  return mergedConfigs;
}

/**
 * 获取单个配置项
 * @param key 配置键，如 "system.db"
 * @param fallback 默认值
 */
export async function getConfig<T = any>(
  key: string,
  fallback?: T
): Promise<T> {
  try {
    const allConfigs = await getAllConfigs();
    return (allConfigs[key] ?? fallback) as T;
  } catch (error) {
    console.error(`[ConfigService] Failed to get config "${key}":`, error);
    return fallback as T;
  }
}

/**
 * 获取配置对象（向后兼容原有的 config.ts 格式）
 */
export async function getConfigObject() {
  try {
    const allConfigs = await getAllConfigs();

    return {
      db: allConfigs['system.db'] ?? defaultConfig.db,
      loginType: allConfigs['auth.loginType'] ?? defaultConfig.loginType,
      loginTypes: allConfigs['auth.loginTypes'] ?? defaultConfig.loginTypes,
      payConfig: allConfigs['payment.methods'] ?? defaultConfig.payConfig,
      goods: allConfigs['product.goods'] ?? defaultConfig.goods,
    };
  } catch (error) {
    console.error('[ConfigService] Failed to get config object:', error);
    return defaultConfig;
  }
}

/**
 * 将默认配置扁平化为键值对
 */
function flattenDefaultConfig(): Record<string, any> {
  return {
    'system.db': defaultConfig.db,
    'auth.loginType': defaultConfig.loginType,
    'auth.loginTypes': defaultConfig.loginTypes,
    'payment.methods': defaultConfig.payConfig,
    'product.goods': defaultConfig.goods,
  };
}
