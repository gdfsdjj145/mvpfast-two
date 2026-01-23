'use client';

import React from 'react';
import { Bot, ExternalLink, Shield, Terminal } from 'lucide-react';

// AI 服务提供商配置
const AI_PROVIDERS = [
  {
    key: 'openrouter',
    name: 'OpenRouter',
    description: '统一 API 访问数百种 AI 模型',
    icon: '🌐',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    envVar: 'OPENROUTER_API_KEY',
    docsUrl: 'https://openrouter.ai/keys',
  },
  {
    key: 'siliconflow',
    name: 'SiliconFlow',
    description: '硅基流动 - 高性价比 AI 服务',
    icon: '⚡',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    envVar: 'SILICONFLOW_API_KEY',
    docsUrl: 'https://cloud.siliconflow.cn',
  },
];

export default function AIConfig() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="alert alert-info">
        <Shield className="w-5 h-5" />
        <div>
          <div className="font-medium">API Key 通过环境变量配置</div>
          <div className="text-sm opacity-80">
            为了安全起见，AI 服务的 API Key 需要在服务器环境变量中配置，而非存储在数据库中。
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {AI_PROVIDERS.map((provider) => (
          <div key={provider.key} className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${provider.bgColor} flex items-center justify-center text-xl`}>
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-xs text-base-content/60">{provider.description}</p>
                  </div>
                </div>
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-xs gap-1"
                >
                  获取 Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Environment Variable */}
              <div className="bg-base-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                  <Terminal className="w-4 h-4" />
                  环境变量
                </div>
                <code className="text-sm font-mono bg-base-300 px-2 py-1 rounded">
                  {provider.envVar}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Guide */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-primary" />
            配置说明
          </h3>
          <div className="text-sm text-base-content/70 space-y-2">
            <p>在 <code className="bg-base-200 px-1 rounded">.env</code> 文件中添加以下环境变量：</p>
            <div className="mockup-code text-xs">
              <pre data-prefix="1"><code># OpenRouter API Key</code></pre>
              <pre data-prefix="2"><code>OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx</code></pre>
              <pre data-prefix="3"><code></code></pre>
              <pre data-prefix="4"><code># SiliconFlow API Key</code></pre>
              <pre data-prefix="5"><code>SILICONFLOW_API_KEY=sk-xxxxxxxx</code></pre>
            </div>
            <p className="text-warning">注意：修改环境变量后需要重启服务才能生效。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
