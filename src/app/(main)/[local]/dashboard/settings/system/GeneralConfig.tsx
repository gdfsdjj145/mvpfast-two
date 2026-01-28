'use client';

import React from 'react';
import { Settings } from 'lucide-react';

interface GeneralConfigProps {
  siteName?: string;
  onChange: (config: { siteName: string }) => void;
}

export default function GeneralConfig({ siteName = '', onChange }: GeneralConfigProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-base-content/60 text-sm">
          配置系统的基本信息
        </p>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Site Name Configuration */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h3 className="card-title text-base mb-3">
              <Settings size={18} />
              站点信息
            </h3>

            {/* Site Name */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">网站名称 *</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="例如: MVPFast"
                value={siteName}
                onChange={(e) => onChange({ siteName: e.target.value })}
              />
              <p className="label text-base-content/60">
                将显示在浏览器标签页和页面标题
              </p>
            </fieldset>

            {/* Preview */}
            <div className="card bg-base-200 shadow mt-4">
              <div className="card-body p-3">
                <h4 className="font-semibold text-sm mb-2">预览效果</h4>
                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                  <img
                    src="/favicon.ico"
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-semibold text-lg">
                    {siteName || '网站名称'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="stats shadow mt-4">
              <div className="stat py-3">
                <div className="stat-title text-xs">名称长度</div>
                <div className="stat-value text-base">{siteName.length} 字符</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Info */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h3 className="card-title text-base mb-3">
              Logo 说明
            </h3>
            <div role="alert" className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm">
                <p>系统 Logo 使用项目中的 favicon.ico 文件</p>
                <p className="mt-1 text-xs opacity-70">
                  如需更换 Logo，请替换 src/app/favicon.ico 文件
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
