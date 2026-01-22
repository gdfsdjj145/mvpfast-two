'use client';

import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Key } from 'lucide-react';

interface AIConfigProps {
  config: {
    apiKey: string;
  };
  onChange: (config: { apiKey: string }) => void;
}

export default function AIConfig({ config, onChange }: AIConfigProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  // 遮蔽 API Key 显示
  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-500" />
          AI 配置
        </h2>
        <p className="text-sm text-base-content/60 mb-4">
          配置 AI 服务的 API 密钥
        </p>

        <div className="space-y-6">
          {/* API Key */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-500" />
              API Key
            </legend>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => onChange({ apiKey: e.target.value })}
                className="input input-bordered w-full pr-12 font-mono"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-square"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="label text-xs text-base-content/60 mt-1">
              用于调用 AI 服务的密钥，请妥善保管
            </p>
          </fieldset>

          {/* 当前配置预览 */}
          {config.apiKey && (
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm font-medium mb-2">当前配置</div>
              <div className="text-sm text-base-content/70">
                <p>
                  API Key: <span className="font-mono">{maskApiKey(config.apiKey)}</span>
                </p>
              </div>
            </div>
          )}

          {!config.apiKey && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">未配置 API Key，AI 功能将无法使用</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
