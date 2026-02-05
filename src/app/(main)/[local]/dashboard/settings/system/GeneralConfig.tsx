'use client';

import React from 'react';
import { Globe, Eye, Type } from 'lucide-react';

interface GeneralConfigProps {
  siteName?: string;
  onChange: (config: { siteName: string }) => void;
}

export default function GeneralConfig({ siteName = '', onChange }: GeneralConfigProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Site Name Configuration */}
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">站点信息</h3>
              <p className="text-xs text-base-content/50">配置网站基本信息</p>
            </div>
          </div>

          {/* Site Name Input */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium flex items-center gap-2">
                <Type size={14} className="text-base-content/50" />
                网站名称
                <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-base-content/40">
                {siteName.length}/20
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:input-primary transition-colors"
              placeholder="例如: MVPFast"
              value={siteName}
              maxLength={20}
              onChange={(e) => onChange({ siteName: e.target.value })}
            />
            <label className="label pt-1">
              <span className="label-text-alt text-base-content/50">
                将显示在浏览器标签页和页面标题
              </span>
            </label>
          </div>

          {/* Character Stats */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  siteName.length > 15 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((siteName.length / 20) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-base-content/50 tabular-nums">
              {siteName.length} 字符
            </span>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-success/10">
              <Eye className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-base">预览效果</h3>
              <p className="text-xs text-base-content/50">实时预览配置效果</p>
            </div>
          </div>

          {/* Browser Tab Preview */}
          <div className="space-y-4">
            {/* Tab Bar Mockup */}
            <div>
              <p className="text-xs text-base-content/50 mb-2">浏览器标签页</p>
              <div className="bg-base-200 rounded-t-lg p-1">
                <div className="bg-base-100 rounded-lg px-3 py-2 flex items-center gap-2 max-w-[200px] shadow-sm">
                  <img
                    src="/favicon.ico"
                    alt="Logo"
                    className="h-4 w-4 object-contain"
                  />
                  <span className="text-sm font-medium truncate">
                    {siteName || '网站名称'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Preview */}
            <div>
              <p className="text-xs text-base-content/50 mb-2">页面标题</p>
              <div className="bg-base-200 rounded-xl p-4 flex items-center gap-3">
                <img
                  src="/favicon.ico"
                  alt="Logo"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <span className="font-bold text-xl">
                    {siteName || '网站名称'}
                  </span>
                  <p className="text-xs text-base-content/50">您的网站标语</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Info */}
          <div className="mt-4 p-3 rounded-xl bg-info/10 border border-info/20">
            <p className="text-xs text-info flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-4 h-4 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                如需更换 Logo，请替换 <code className="bg-info/20 px-1 rounded">src/app/favicon.ico</code> 文件
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
