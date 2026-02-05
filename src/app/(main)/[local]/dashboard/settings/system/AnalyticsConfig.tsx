'use client';

import React from 'react';
import { BarChart3, ExternalLink, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsConfigProps {
  config: {
    googleAnalyticsId: string;
  };
  onChange: (config: { googleAnalyticsId: string }) => void;
}

export default function AnalyticsConfig({ config, onChange }: AnalyticsConfigProps) {
  const isValidId = !config.googleAnalyticsId || /^G-[A-Z0-9]+$/.test(config.googleAnalyticsId);
  const isConfigured = !!config.googleAnalyticsId && isValidId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Configuration Card */}
      <div className="lg:col-span-2 card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-base">网站统计分析</h3>
              <p className="text-xs text-base-content/50">配置 Google Analytics 追踪代码</p>
            </div>
          </div>

          {/* Google Analytics Input */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-[#F9AB00]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
                Google Analytics 4 ID
              </span>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="label-text-alt link link-primary flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                获取 ID
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.googleAnalyticsId}
                onChange={(e) => onChange({ googleAnalyticsId: e.target.value.toUpperCase() })}
                className={`input input-bordered w-full font-mono tracking-wide ${
                  config.googleAnalyticsId && !isValidId ? 'input-error' : 'focus:input-primary'
                }`}
                placeholder="G-XXXXXXXXXX"
              />
              {isConfigured && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    已配置
                  </span>
                </span>
              )}
            </div>
            <label className="label pt-1">
              <span className="label-text-alt text-base-content/50">
                输入您的 Google Analytics 4 测量 ID，留空则禁用统计
              </span>
              {config.googleAnalyticsId && !isValidId && (
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertTriangle size={12} />
                  格式错误，应为 G-XXXXXXXX
                </span>
              )}
            </label>
          </div>

          {/* Format Guide */}
          <div className="mt-4 p-4 rounded-xl bg-base-200/50">
            <p className="text-xs text-base-content/60 mb-2">ID 格式说明</p>
            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">G-</span>
              <span className="text-base-content/40">+</span>
              <span className="px-3 py-1.5 rounded-lg bg-base-300 text-base-content/70">8-10 位字母数字</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 h-fit">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">配置状态</h3>
              <p className="text-xs text-base-content/50">当前统计服务状态</p>
            </div>
          </div>

          {isConfigured ? (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-success/5 to-emerald-500/10 border border-success/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium text-success">统计服务已启用</span>
                </div>
                <p className="text-sm text-base-content/60">
                  Google Analytics 将在所有页面自动加载并追踪访问数据
                </p>
              </div>

              {/* Current ID */}
              <div className="p-3 rounded-xl bg-base-200/50">
                <p className="text-xs text-base-content/50 mb-1">当前配置 ID</p>
                <p className="font-mono font-medium text-primary">{config.googleAnalyticsId}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Warning Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-warning/5 to-amber-500/10 border border-warning/20">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">统计服务未启用</span>
                </div>
                <p className="text-sm text-base-content/60">
                  配置 Google Analytics ID 后即可开始追踪网站访问数据
                </p>
              </div>

              {/* Quick Guide */}
              <div className="p-3 rounded-xl bg-base-200/50">
                <p className="text-xs text-base-content/50 mb-2">快速开始</p>
                <ol className="text-xs text-base-content/70 space-y-1 list-decimal list-inside">
                  <li>访问 Google Analytics</li>
                  <li>创建或选择媒体资源</li>
                  <li>复制测量 ID (G-XXXX)</li>
                  <li>粘贴到上方输入框</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
