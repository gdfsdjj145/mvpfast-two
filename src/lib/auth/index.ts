/**
 * 认证授权模块
 *
 * @module @/lib/auth
 */

// RBAC 权限系统
export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  getAllPermissions,
  type Permission,
  type Role,
} from './rbac';

// 认证工具
export {
  getSessionRole,
  requireAdmin,
  isAdmin,
  requirePermission,
  getClientInfo,
  type AdminUser,
} from './utils';
