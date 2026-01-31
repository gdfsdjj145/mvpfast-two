// ============ 权限定义 ============
export const PERMISSIONS = {
  'dashboard:access': '访问控制台',
  'profile:edit':     '编辑个人资料',
  'order:own':        '查看自己的订单',
  'credit:own':       '查看自己的积分',
  'upload:create':    '上传文件',
  'ai:chat':          '使用 AI 聊天',
  'user:list':        '查看用户列表',
  'user:edit':        '编辑用户信息',
  'order:list':       '查看所有订单',
  'order:delete':     '删除订单',
  'credit:adjust':    '调整用户积分',
  'post:manage':      '管理文章',
  'redemption:manage':'管理兑换码',
  'system:manage':    '管理系统配置',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ============ 角色定义 ============
export type Role = 'admin' | 'user';
// 扩展示例: export type Role = 'admin' | 'editor' | 'user';

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[] | readonly ['*']> = {
  admin: ['*'],   // 超级管理员，拥有全部权限
  user: [
    'dashboard:access',
    'profile:edit',
    'order:own',
    'credit:own',
    'upload:create',
    'ai:chat',
  ],
  // 扩展示例:
  // editor: [
  //   ...ROLE_PERMISSIONS.user,  // 继承 user 权限
  //   'post:manage',
  // ],
};

// ============ 权限检查函数 ============

/**
 * 检查指定角色是否拥有某个权限
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  if (permissions[0] === '*') return true;
  return (permissions as readonly Permission[]).includes(permission);
}

/**
 * 检查指定角色是否拥有任意一个权限
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * 获取指定角色的所有权限列表
 */
export function getAllPermissions(role: string): Permission[] {
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return [];
  if (permissions[0] === '*') return Object.keys(PERMISSIONS) as Permission[];
  return [...(permissions as readonly Permission[])];
}

// ============ 路由权限映射 ============
// 用于 middleware 和 dashboard menu
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard/users':           'user:list',
  '/dashboard/roles':           'user:edit',
  '/dashboard/order':           'order:list',
  '/dashboard/credits':         'credit:own',
  '/dashboard/redemption':      'redemption:manage',
  '/dashboard/posts':           'post:manage',
  '/dashboard/settings/system': 'system:manage',
};
