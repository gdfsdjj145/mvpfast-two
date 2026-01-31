'use client';

import React from 'react';
import {
  Shield,
  User,
  Check,
  X,
} from 'lucide-react';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getAllPermissions,
  type Role,
  type Permission,
} from '@/lib/rbac';

// 权限分组展示
const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: '基础功能',
    permissions: ['dashboard:access', 'profile:edit', 'order:own', 'credit:own', 'upload:create', 'ai:chat'],
  },
  {
    label: '用户管理',
    permissions: ['user:list', 'user:edit'],
  },
  {
    label: '订单管理',
    permissions: ['order:list', 'order:delete'],
  },
  {
    label: '内容管理',
    permissions: ['post:manage', 'redemption:manage'],
  },
  {
    label: '系统管理',
    permissions: ['credit:adjust', 'system:manage'],
  },
];

const ROLE_META: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: '管理员',
    color: 'badge-warning',
    icon: <Shield size={16} />,
  },
  user: {
    label: '普通用户',
    color: 'badge-ghost',
    icon: <User size={16} />,
  },
};

const roles = Object.keys(ROLE_PERMISSIONS) as Role[];

export default function RolesPage() {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="w-40">权限分组</th>
                <th>权限</th>
                <th>说明</th>
                {roles.map((role) => (
                  <th key={role} className="text-center">
                    <div className={`badge ${ROLE_META[role].color} badge-sm gap-1`}>
                      {ROLE_META[role].icon}
                      {ROLE_META[role].label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) =>
                group.permissions.map((perm, idx) => (
                  <tr key={perm} className={idx === 0 ? 'border-t-2 border-base-300' : ''}>
                    {idx === 0 && (
                      <td
                        rowSpan={group.permissions.length}
                        className="font-medium text-base-content/80 align-top bg-base-200/50"
                      >
                        {group.label}
                      </td>
                    )}
                    <td>
                      <code className="text-xs bg-base-200 px-1.5 py-0.5 rounded">{perm}</code>
                    </td>
                    <td className="text-xs text-base-content/60">
                      {PERMISSIONS[perm]}
                    </td>
                    {roles.map((role) => {
                      const has = getAllPermissions(role).includes(perm);
                      return (
                        <td key={role} className="text-center">
                          {has ? (
                            <Check size={16} className="text-success inline-block" />
                          ) : (
                            <X size={16} className="text-base-content/20 inline-block" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
