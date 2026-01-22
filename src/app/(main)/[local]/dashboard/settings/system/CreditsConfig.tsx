'use client';

import React from 'react';
import { Gift, Calendar, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

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
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          积分配置
        </h2>
        <p className="text-sm text-base-content/60 mb-4">
          配置新用户注册时的积分赠送规则
        </p>

        <div className="space-y-6">
          {/* 赠送积分开关 */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">赠送积分开关</legend>
            <label className="label cursor-pointer justify-start gap-4 p-0">
              <span className="flex-1 text-sm text-base-content/70">
                开启后，新注册的用户会自动获得赠送积分
              </span>
              <button
                type="button"
                onClick={() => onChange({ ...config, initial_credits_enabled: !config.initial_credits_enabled })}
                className={`btn btn-ghost btn-sm p-0 ${config.initial_credits_enabled ? 'text-success' : 'text-base-content/40'}`}
              >
                {config.initial_credits_enabled ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </label>
          </fieldset>

          {/* 以下配置项仅在开启赠送时显示 */}
          {config.initial_credits_enabled && (
            <>
              {/* 赠送积分数额 */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  赠送积分数额 *
                </legend>
                <input
                  type="number"
                  min="1"
                  value={config.initial_credits_amount}
                  onChange={(e) => onChange({ ...config, initial_credits_amount: parseInt(e.target.value) || 0 })}
                  className="input input-bordered w-full"
                  placeholder="请输入赠送的积分数量"
                />
                <p className="label text-xs text-base-content/60 mt-1">
                  新用户注册后将自动获得此数量的积分
                </p>
              </fieldset>

              {/* 积分有效期 */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  积分有效期（天）
                </legend>
                <input
                  type="number"
                  min="0"
                  value={config.initial_credits_valid_days}
                  onChange={(e) => onChange({ ...config, initial_credits_valid_days: parseInt(e.target.value) || 0 })}
                  className="input input-bordered w-full"
                  placeholder="0 表示永久有效"
                />
                <p className="label text-xs text-base-content/60 mt-1">
                  设置为 0 表示积分永久有效，不会过期
                </p>
              </fieldset>

              {/* 赠送描述 */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  赠送描述
                </legend>
                <textarea
                  value={config.initial_credits_description}
                  onChange={(e) => onChange({ ...config, initial_credits_description: e.target.value })}
                  className="textarea textarea-bordered w-full"
                  placeholder="例如：新用户注册赠送积分"
                  rows={2}
                />
                <p className="label text-xs text-base-content/60 mt-1">
                  此描述将显示在用户的积分交易记录中
                </p>
              </fieldset>

              {/* 预览卡片 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <div className="text-sm font-medium text-amber-800 mb-2">配置预览</div>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>新用户注册将获得 <span className="font-bold text-amber-600">{config.initial_credits_amount}</span> 积分</p>
                  <p>
                    有效期：
                    <span className="font-bold text-amber-600">
                      {config.initial_credits_valid_days === 0 ? '永久有效' : `${config.initial_credits_valid_days} 天`}
                    </span>
                  </p>
                  {config.initial_credits_description && (
                    <p>描述：{config.initial_credits_description}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
