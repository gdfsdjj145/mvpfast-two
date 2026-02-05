'use client';

import React from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';

// 固定的支付方式配置
const PAYMENT_METHOD = {
  key: 'wechat',
  name: '微信支付',
  icon: '/payment/wechat-pay.png',
};

export default function PaymentConfig() {
  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/10 border border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">支付渠道</h3>
            <p className="text-sm text-base-content/60">
              当前支持 <span className="font-bold text-emerald-600">1</span> 种支付方式
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative card bg-base-100 border-2 border-success shadow-lg shadow-success/10">
          {/* Default Badge */}
          <div className="absolute -top-2.5 left-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success text-success-content text-xs font-medium shadow-sm">
              <ShieldCheck size={12} />
              默认支付
            </span>
          </div>

          <div className="card-body p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center overflow-hidden">
                <img
                  src={PAYMENT_METHOD.icon}
                  alt={PAYMENT_METHOD.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base">{PAYMENT_METHOD.name}</h3>
                <p className="text-xs text-base-content/40 font-mono">{PAYMENT_METHOD.key}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                已启用
              </div>
              <span className="text-xs text-base-content/40">系统默认</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-base-200/50 text-sm text-base-content/60">
        <p>支付方式为系统内置配置，如需添加其他支付渠道请联系开发者。</p>
      </div>
    </div>
  );
}
