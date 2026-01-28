'use client';

import React from 'react';
import { BarChart3, ExternalLink } from 'lucide-react';

interface AnalyticsConfigProps {
  config: {
    googleAnalyticsId: string;
  };
  onChange: (config: { googleAnalyticsId: string }) => void;
}

export default function AnalyticsConfig({ config, onChange }: AnalyticsConfigProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          统计配置
        </h2>
        <p className="text-sm text-base-content/60 mb-4">
          配置网站统计分析服务
        </p>

        <div className="space-y-6">
          {/* Google Analytics */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              Google Analytics ID
            </legend>
            <input
              type="text"
              value={config.googleAnalyticsId}
              onChange={(e) => onChange({ googleAnalyticsId: e.target.value.toUpperCase() })}
              className="input w-full font-mono"
              placeholder="G-XXXXXXXXXX"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="label text-base-content/60">
                输入您的 Google Analytics 4 测量 ID，留空则禁用统计
              </p>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs link link-primary flex items-center gap-1"
              >
                获取 ID
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </fieldset>

          {/* 预览 */}
          {config.googleAnalyticsId && (
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm font-medium mb-2">配置预览</div>
              <div className="text-sm text-base-content/70 space-y-1">
                <p>
                  Google Analytics ID: <span className="font-mono font-bold text-primary">{config.googleAnalyticsId}</span>
                </p>
                <p className="text-xs text-base-content/50">
                  保存后，Google Analytics 将自动在所有页面加载
                </p>
              </div>
            </div>
          )}

          {!config.googleAnalyticsId && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">未配置 Google Analytics，网站统计功能已禁用</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
