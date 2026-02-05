'use client';

import React from 'react';
import { Shield, Mail, Phone, Chrome, KeyRound, Check, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthConfigProps {
  loginType: string;
  loginTypes: string[];
  onChange: (config: { loginType: string; loginTypes: string[] }) => void;
}

const AUTH_METHODS = [
  {
    key: 'password',
    name: '账号密码登录',
    description: '使用邮箱/手机号和密码登录',
    icon: KeyRound,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 to-purple-600/10',
  },
  {
    key: 'phone',
    name: '手机号登录',
    description: '使用手机号和验证码登录',
    icon: Phone,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    key: 'email',
    name: '邮箱登录',
    description: '使用邮箱和验证码登录',
    icon: Mail,
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
  },
  {
    key: 'wx',
    name: '微信登录',
    description: '使用微信扫码或授权登录',
    icon: Chrome,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
  },
];

export default function AuthConfig({ loginType, loginTypes, onChange }: AuthConfigProps) {
  // 切换启用/禁用登录方式
  const toggleAuthMethod = (key: string) => {
    if (loginTypes.includes(key)) {
      if (loginTypes.length === 1) {
        toast.error('至少需要保留一个登录方式');
        return;
      }
      const newLoginTypes = loginTypes.filter(t => t !== key);
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
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
        <div className="p-2 rounded-xl bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">配置说明</h3>
          <p className="text-sm text-base-content/60">
            启用的登录方式将在登录页面显示。带有
            <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
              <Star size={10} fill="currentColor" />
              默认
            </span>
            标记的方式将作为首选登录方式。
          </p>
        </div>
      </div>

      {/* Auth Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUTH_METHODS.map((method) => {
          const isEnabled = loginTypes.includes(method.key);
          const isDefault = loginType === method.key;
          const Icon = method.icon;

          return (
            <div
              key={method.key}
              className={`
                relative card bg-base-100 border-2 transition-all duration-300 cursor-pointer
                ${isEnabled
                  ? isDefault
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-base-200 shadow-md hover:shadow-lg hover:border-primary/30'
                  : 'border-base-200 opacity-60 hover:opacity-80'
                }
              `}
            >
              {/* Default Badge */}
              {isDefault && (
                <div className="absolute -top-2.5 left-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-content text-xs font-medium shadow-sm">
                    <Star size={10} fill="currentColor" />
                    默认方式
                  </span>
                </div>
              )}

              <div className="card-body p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${method.bgGradient}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base flex items-center gap-2 flex-wrap">
                        {method.name}
                        {isEnabled && !isDefault && (
                          <span className="badge badge-ghost badge-sm">已启用</span>
                        )}
                      </h3>
                      <p className="text-sm text-base-content/50 mt-0.5">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <label className="swap swap-flip">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleAuthMethod(method.key)}
                    />
                    <div className="swap-on">
                      <div className="w-10 h-6 rounded-full bg-primary flex items-center justify-end pr-1 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <Check size={10} className="text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="swap-off">
                      <div className="w-10 h-6 rounded-full bg-base-300 flex items-center pl-1 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                {isEnabled && !isDefault && (
                  <div className="mt-3 pt-3 border-t border-base-200">
                    <button
                      onClick={() => setAsDefault(method.key)}
                      className="btn btn-ghost btn-sm gap-1.5 text-primary hover:bg-primary/10"
                    >
                      <Star size={14} />
                      设为默认方式
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-base-200/50">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-base-content/50">已启用方式</p>
            <p className="text-xl font-bold tabular-nums">{loginTypes.length}</p>
          </div>
          <div className="w-px h-8 bg-base-300" />
          <div>
            <p className="text-xs text-base-content/50">默认方式</p>
            <p className="text-sm font-medium">
              {AUTH_METHODS.find(m => m.key === loginType)?.name || '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {AUTH_METHODS.map(method => {
            const isEnabled = loginTypes.includes(method.key);
            const Icon = method.icon;
            return (
              <div
                key={method.key}
                className={`p-2 rounded-lg transition-all ${
                  isEnabled ? 'bg-primary/10 text-primary' : 'bg-base-300/50 text-base-content/20'
                }`}
                title={method.name}
              >
                <Icon size={16} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
