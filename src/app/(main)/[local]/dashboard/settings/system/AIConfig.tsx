'use client';

import React from 'react';
import { Bot, ExternalLink, Shield, Terminal, Zap, Globe, Copy, Check } from 'lucide-react';

const AI_PROVIDERS = [
  {
    key: 'openrouter',
    name: 'OpenRouter',
    description: '统一 API 访问数百种 AI 模型',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    envVar: 'OPENROUTER_API_KEY',
    docsUrl: 'https://openrouter.ai/keys',
    features: ['多模型支持', '统一 API', '按量计费'],
  },
  {
    key: 'siliconflow',
    name: 'SiliconFlow',
    description: '硅基流动 - 高性价比 AI 服务',
    icon: Zap,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    envVar: 'SILICONFLOW_API_KEY',
    docsUrl: 'https://cloud.siliconflow.cn',
    features: ['国内服务', '低延迟', '性价比高'],
  },
];

export default function AIConfig() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-info/5 to-info/10 border border-info/10">
        <div className="p-2 rounded-xl bg-info/10 shrink-0">
          <Shield className="w-5 h-5 text-info" />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">API Key 安全说明</h3>
          <p className="text-sm text-base-content/60">
            为了安全起见，AI 服务的 API Key 需要在服务器环境变量中配置，而非存储在数据库中。
            修改后需要重启服务才能生效。
          </p>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {AI_PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          return (
            <div key={provider.key} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
              <div className="card-body p-6">
                {/* Provider Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${provider.bgGradient}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{provider.name}</h3>
                      <p className="text-sm text-base-content/50">{provider.description}</p>
                    </div>
                  </div>
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm gap-1.5 hover:bg-primary/10 hover:text-primary"
                  >
                    获取 Key
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Environment Variable */}
                <div className="p-4 rounded-xl bg-base-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <Terminal className="w-4 h-4" />
                      环境变量
                    </div>
                    <button
                      onClick={() => copyToClipboard(provider.envVar, provider.key)}
                      className="btn btn-ghost btn-xs gap-1 hover:bg-primary/10"
                    >
                      {copiedKey === provider.key ? (
                        <>
                          <Check size={12} className="text-success" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block text-sm font-mono bg-base-300 px-3 py-2 rounded-lg">
                    {provider.envVar}
                  </code>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Guide */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">配置说明</h3>
              <p className="text-xs text-base-content/50">在 .env 文件中添加环境变量</p>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => copyToClipboard(
                  `# OpenRouter API Key\nOPENROUTER_API_KEY=sk-or-v1-xxxxxxxx\n\n# SiliconFlow API Key\nSILICONFLOW_API_KEY=sk-xxxxxxxx`,
                  'all'
                )}
                className="btn btn-ghost btn-xs gap-1 bg-base-100/80 hover:bg-base-100"
              >
                {copiedKey === 'all' ? (
                  <>
                    <Check size={12} className="text-success" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    复制全部
                  </>
                )}
              </button>
            </div>
            <div className="bg-base-200 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <div className="space-y-1">
                <p className="text-base-content/50"># OpenRouter API Key</p>
                <p>OPENROUTER_API_KEY=<span className="text-primary">sk-or-v1-xxxxxxxx</span></p>
                <p className="text-base-content/50 pt-2"># SiliconFlow API Key</p>
                <p>SILICONFLOW_API_KEY=<span className="text-purple-500">sk-xxxxxxxx</span></p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
            <span className="text-warning text-lg">⚠️</span>
            <p className="text-sm text-warning">
              修改环境变量后需要<strong>重启服务</strong>才能生效
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
