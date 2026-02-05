/**
 * 外部服务模块
 *
 * @module @/lib/services
 */

// 邮件服务
export { default as sendEmail, type MailInfo } from './email';

// 短信服务
export { default as sendPhone } from './sms';

// 存储服务
export {
  validateFile,
  generateKey,
  uploadToR2,
  deleteFromR2,
  getKeyFromUrl,
} from './storage';

// 支付服务
export {
  generateNonce,
  generateTimestamp,
  generateJsapiSignature,
  createNativeOrder,
  createJsapiOrder,
  queryOrder,
  paySign,
} from './pay';
