'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  key: string;
  name: string;
  icon: string;
  use: boolean;
  isDefault?: boolean;
}

interface PaymentConfigProps {
  initialMethods: PaymentMethod[];
  onSave: (methods: PaymentMethod[]) => Promise<void>;
}

export default function PaymentConfig({ initialMethods, onSave }: PaymentConfigProps) {
  // 隐藏的支付方式（暂时不显示）
  const hiddenMethods = ['yungou', 'yungouos'];

  // 确保微信支付始终存在且标记为默认
  const ensureWechatPay = (methods: PaymentMethod[]): PaymentMethod[] => {
    return methods.map(m => m.key === 'wechat' ? { ...m, isDefault: true, use: true } : m);
  };

  // 过滤掉隐藏的支付方式
  const filterHiddenMethods = (methods: PaymentMethod[]): PaymentMethod[] => {
    return methods.filter(m => !hiddenMethods.includes(m.key));
  };

  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  // 当 initialMethods 变化时更新 methods
  useEffect(() => {
    setMethods(filterHiddenMethods(ensureWechatPay(initialMethods)));
  }, [initialMethods]);

  // 切换启用/禁用
  const toggleStatus = async (key: string) => {
    const method = methods.find(m => m.key === key);
    if (method?.isDefault) {
      toast.error('默认支付方式不可禁用');
      return;
    }

    const updatedMethods = methods.map(m =>
      m.key === key ? { ...m, use: !m.use } : m
    );

    // 至少保留一个启用的支付方式
    const hasEnabled = updatedMethods.some(m => m.use);
    if (!hasEnabled) {
      toast.error('至少需要保留一个启用的支付方式');
      return;
    }

    try {
      await onSave(updatedMethods);
      setMethods(updatedMethods);
      const updatedMethod = updatedMethods.find(m => m.key === key);
      toast.success(updatedMethod?.use ? '支付方式已启用' : '支付方式已禁用');
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-base-content/60 text-sm">
          管理系统支持的支付方式，可启用或禁用已配置的支付渠道
        </p>
      </div>

      {/* Payment Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {methods.map((method) => (
          <div
            key={method.key}
            className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all ${
              method.use ? 'ring-2 ring-primary/20' : 'opacity-60'
            } ${method.isDefault ? 'ring-2 ring-success/40' : ''}`}
          >
            <div className="card-body p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon Preview */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-base-200">
                    {method.icon ? (
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <CreditCard className="w-6 h-6 text-base-content/40 hidden" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      {method.name}
                      {method.isDefault && (
                        <ShieldCheck size={14} className="text-success" />
                      )}
                    </h3>
                    <p className="text-xs text-base-content/60 font-mono">
                      {method.key}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-1">
                  {method.isDefault && (
                    <div className="badge badge-success badge-sm gap-1">
                      <Lock size={10} />
                      默认
                    </div>
                  )}
                  <div className={`badge badge-sm ${method.use ? 'badge-success' : 'badge-ghost'}`}>
                    {method.use ? '已启用' : '已禁用'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="card-actions justify-between mt-3 pt-3 border-t border-base-300">
                <div className="form-control">
                  <label className={`label cursor-pointer gap-2 p-0 ${method.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="label-text text-sm">启用</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={method.use}
                      onChange={() => toggleStatus(method.key)}
                      disabled={method.isDefault}
                    />
                  </label>
                </div>

                {method.isDefault && (
                  <div className="flex items-center text-xs text-base-content/40 gap-1">
                    <Lock size={12} />
                    锁定
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {methods.length === 0 && (
          <div className="col-span-full card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-8">
              <CreditCard className="w-12 h-12 text-base-content/20 mb-3" />
              <h3 className="font-semibold mb-2">暂无支付方式</h3>
              <p className="text-base-content/60 text-sm">
                暂无可用的支付方式
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
