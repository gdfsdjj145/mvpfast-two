'use client';

import React from 'react';
import { Gift, Calendar, FileText, Coins, Sparkles } from 'lucide-react';

interface CreditsConfigProps {
  config: {
    initial_credits_enabled: boolean;
    initial_credits_amount: number;
    initial_credits_valid_days: number;
    initial_credits_description: string;
  };
  onChange: (config: {
    initial_credits_enabled: boolean;
    initial_credits_amount: number;
    initial_credits_valid_days: number;
    initial_credits_description: string;
  }) => void;
}

export default function CreditsConfig({ config, onChange }: CreditsConfigProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Configuration Card */}
      <div className="lg:col-span-2 card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base">新用户积分赠送</h3>
                <p className="text-xs text-base-content/50">配置新注册用户的积分奖励</p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`text-sm font-medium ${config.initial_credits_enabled ? 'text-success' : 'text-base-content/50'}`}>
                {config.initial_credits_enabled ? '已开启' : '已关闭'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success toggle-lg"
                checked={config.initial_credits_enabled}
                onChange={() => onChange({ ...config, initial_credits_enabled: !config.initial_credits_enabled })}
              />
            </label>
          </div>

          {/* Disabled State */}
          {!config.initial_credits_enabled && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-base-content/20" />
              </div>
              <h4 className="font-medium mb-2">积分赠送已关闭</h4>
              <p className="text-sm text-base-content/50 max-w-sm">
                开启后，新注册的用户将自动获得指定数量的积分奖励
              </p>
            </div>
          )}

          {/* Configuration Form */}
          {config.initial_credits_enabled && (
            <div className="space-y-5">
              {/* Credits Amount */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Coins size={14} className="text-amber-500" />
                    赠送积分数额
                    <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={config.initial_credits_amount}
                    onChange={(e) => onChange({ ...config, initial_credits_amount: parseInt(e.target.value) || 0 })}
                    className="input input-bordered w-full pr-16 focus:input-primary"
                    placeholder="请输入赠送的积分数量"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-base-content/50">
                    积分
                  </span>
                </div>
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/50">
                    新用户注册后将自动获得此数量的积分
                  </span>
                </label>
              </div>

              {/* Valid Days */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" />
                    积分有效期
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={config.initial_credits_valid_days}
                    onChange={(e) => onChange({ ...config, initial_credits_valid_days: parseInt(e.target.value) || 0 })}
                    className="input input-bordered w-full pr-12 focus:input-primary"
                    placeholder="0 表示永久有效"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-base-content/50">
                    天
                  </span>
                </div>
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/50">
                    设置为 0 表示积分永久有效，不会过期
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FileText size={14} className="text-emerald-500" />
                    赠送描述
                  </span>
                  <span className="label-text-alt text-base-content/40">
                    {config.initial_credits_description.length}/50
                  </span>
                </label>
                <textarea
                  value={config.initial_credits_description}
                  onChange={(e) => onChange({ ...config, initial_credits_description: e.target.value })}
                  className="textarea textarea-bordered w-full focus:textarea-primary resize-none"
                  placeholder="例如：新用户注册赠送积分"
                  rows={2}
                  maxLength={50}
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/50">
                    此描述将显示在用户的积分交易记录中
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 h-fit">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">配置预览</h3>
              <p className="text-xs text-base-content/50">实时预览效果</p>
            </div>
          </div>

          {config.initial_credits_enabled ? (
            <div className="space-y-4">
              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-amber-700/70">新用户奖励</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                    <Gift size={10} />
                    赠送
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-amber-600">
                    +{config.initial_credits_amount}
                  </span>
                  <span className="text-sm text-amber-600/70">积分</span>
                </div>
                <div className="text-xs text-amber-700/60 space-y-1">
                  <p>有效期：{config.initial_credits_valid_days === 0 ? '永久有效' : `${config.initial_credits_valid_days} 天`}</p>
                  {config.initial_credits_description && (
                    <p className="truncate">{config.initial_credits_description}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-base-200/50 text-center">
                  <p className="text-2xl font-bold text-base-content">{config.initial_credits_amount}</p>
                  <p className="text-xs text-base-content/50">赠送积分</p>
                </div>
                <div className="p-3 rounded-xl bg-base-200/50 text-center">
                  <p className="text-2xl font-bold text-base-content">
                    {config.initial_credits_valid_days || '∞'}
                  </p>
                  <p className="text-xs text-base-content/50">有效天数</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-base-200/30 text-center">
              <Gift className="w-10 h-10 text-base-content/20 mx-auto mb-2" />
              <p className="text-sm text-base-content/50">
                开启积分赠送后<br />此处显示预览
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
