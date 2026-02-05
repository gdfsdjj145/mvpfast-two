/**
 * 配置模块
 *
 * @module @/lib/config
 */

// 环境变量
export {
  serverEnv,
  clientEnv,
  isDevelopment,
  isProduction,
  isTest,
  isWechatPayConfigured,
  isYungouPayConfigured,
  isSmsConfigured,
  isR2Configured,
  isEmailConfigured,
  getRequiredEnv,
  getOptionalEnv,
  type ServerEnv,
  type ClientEnv,
} from './env';

// 配置服务
export {
  clearConfigCache,
  getAllConfigs,
  getConfig,
  getConfigObject,
} from './service';
