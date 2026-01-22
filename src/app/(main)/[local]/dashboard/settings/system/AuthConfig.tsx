'use client';

import React from 'react';
import { Shield, Mail, Phone, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthConfigProps {
  loginType: string;
  loginTypes: string[];
  onChange: (config: { loginType: string; loginTypes: string[] }) => void;
}

const AUTH_METHODS = [
  {
    key: 'wx',
    name: '微信登录',
    description: '使用微信扫码或授权登录',
    icon: Chrome,
    color: 'text-success',
    badgeColor: 'badge-success',
  },
  {
    key: 'phone',
    name: '手机号登录',
    description: '使用手机号和验证码登录',
    icon: Phone,
    color: 'text-info',
    badgeColor: 'badge-info',
  },
  {
    key: 'email',
    name: '邮箱登录',
    description: '使用邮箱和验证码登录',
    icon: Mail,
    color: 'text-secondary',
    badgeColor: 'badge-secondary',
  },
];

export default function AuthConfig({ loginType, loginTypes, onChange }: AuthConfigProps) {
  // 切换启用/禁用登录方式
  const toggleAuthMethod = (key: string) => {
    if (loginTypes.includes(key)) {
      // 至少保留一个登录方式
      if (loginTypes.length === 1) {
        toast.error('至少需要保留一个登录方式');
        return;
      }
      const newLoginTypes = loginTypes.filter(t => t !== key);
      // 如果禁用的是默认登录方式，切换到第一个可用的
      const newLoginType = loginType === key
        ? (newLoginTypes[0] || loginTypes[0])
        : loginType;
      onChange({ loginType: newLoginType, loginTypes: newLoginTypes });
    } else {
      onChange({ loginType, loginTypes: [...loginTypes, key] });
    }
  };

  // 设置默认登录方式
  const setAsDefault = (key: string) => {
    if (!loginTypes.includes(key)) {
      toast.error('请先启用此登录方式');
      return;
    }
    onChange({ loginType: key, loginTypes });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-base-content/60 text-sm">
          配置系统支持的登录方式和默认登录方式
        </p>
      </div>

      {/* Info Alert */}
      <div role="alert" className="alert alert-info py-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">配置说明</h3>
          <div className="text-sm">
            启用的登录方式将在登录页面显示。默认登录方式将作为首选登录方式。
          </div>
        </div>
      </div>

      {/* Auth Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AUTH_METHODS.map((method) => {
          const isEnabled = loginTypes.includes(method.key);
          const isDefault = loginType === method.key;
          const Icon = method.icon;

          return (
            <div
              key={method.key}
              className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all ${
                isEnabled ? 'ring-2 ring-primary/20' : 'opacity-60'
              } ${isDefault ? 'ring-primary ring-2' : ''}`}
            >
              <div className="card-body p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-base-200 ${method.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        {method.name}
                        {isDefault && (
                          <div className="badge badge-primary badge-sm">默认</div>
                        )}
                        {isEnabled && !isDefault && (
                          <div className="badge badge-ghost badge-sm">已启用</div>
                        )}
                      </h3>
                      <p className="text-sm text-base-content/60 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isEnabled}
                    onChange={() => toggleAuthMethod(method.key)}
                  />
                </div>

                {/* Actions */}
                {isEnabled && !isDefault && (
                  <div className="card-actions justify-end mt-2 pt-2 border-t border-base-300">
                    <button
                      onClick={() => setAsDefault(method.key)}
                      className="btn btn-ghost btn-sm gap-2"
                    >
                      设为默认
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Config Display */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3">当前配置预览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-base-content/60 mb-1">默认登录方式</div>
              <div className="flex items-center gap-2">
                <div className={`badge ${AUTH_METHODS.find(m => m.key === loginType)?.badgeColor || 'badge-ghost'}`}>
                  {AUTH_METHODS.find(m => m.key === loginType)?.name || loginType}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-base-content/60 mb-1">已启用的登录方式</div>
              <div className="flex flex-wrap gap-2">
                {loginTypes.map(type => {
                  const method = AUTH_METHODS.find(m => m.key === type);
                  return (
                    <div key={type} className={`badge ${method?.badgeColor || 'badge-ghost'}`}>
                      {method?.name || type}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
