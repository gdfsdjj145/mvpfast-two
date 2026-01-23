'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Shield, CreditCard, Gift, BarChart3, Bot, Loader2, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AuthConfig from './AuthConfig';
import PaymentConfig from './PaymentConfig';
import GeneralConfig from './GeneralConfig';
import CreditsConfig from './CreditsConfig';
import AnalyticsConfig from './AnalyticsConfig';
import AIConfig from './AIConfig';
import { config as appConfig } from '@/config';

type ConfigType = 'boolean' | 'string' | 'array' | 'object';
type ConfigCategory = 'system' | 'auth' | 'payment' | 'product' | 'credits';
type TabType = 'general' | 'auth' | 'payment' | 'credits' | 'analytics' | 'ai';

// 本地配置状态类型
interface LocalGeneralConfig {
  siteName: string;
}

interface LocalAuthConfig {
  loginType: string;
  loginTypes: string[];
}

interface LocalCreditsConfig {
  initial_credits_enabled: boolean;
  initial_credits_amount: number;
  initial_credits_valid_days: number;
  initial_credits_description: string;
}

interface LocalAnalyticsConfig {
  googleAnalyticsId: string;
}

interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: ConfigType;
  category: ConfigCategory;
  description?: string;
  isActive: boolean;
  updated_time: Date;
}

// 默认积分配置
const defaultCreditsConfig = {
  initial_credits_enabled: false,
  initial_credits_amount: 100,
  initial_credits_valid_days: 0,
  initial_credits_description: '新用户注册赠送积分',
};

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 默认网站名称
  const DEFAULT_SITE_NAME = 'MvpFast';

  // 原始配置（从服务器加载的）
  const [authConfig, setAuthConfig] = useState<LocalAuthConfig>({ loginType: 'phone', loginTypes: ['phone'] });
  const [paymentConfig, setPaymentConfig] = useState<any[]>([]);
  const [generalConfig, setGeneralConfig] = useState<LocalGeneralConfig>({ siteName: DEFAULT_SITE_NAME });
  const [creditsConfig, setCreditsConfig] = useState<LocalCreditsConfig>(defaultCreditsConfig);
  const [analyticsConfig, setAnalyticsConfig] = useState<LocalAnalyticsConfig>({ googleAnalyticsId: '' });

  // 本地编辑状态（用户编辑但未保存的）
  const [localAuthConfig, setLocalAuthConfig] = useState<LocalAuthConfig>({ loginType: 'phone', loginTypes: ['phone'] });
  const [localGeneralConfig, setLocalGeneralConfig] = useState<LocalGeneralConfig>({ siteName: DEFAULT_SITE_NAME });
  const [localCreditsConfig, setLocalCreditsConfig] = useState<LocalCreditsConfig>(defaultCreditsConfig);
  const [localAnalyticsConfig, setLocalAnalyticsConfig] = useState<LocalAnalyticsConfig>({ googleAnalyticsId: '' });

  // 是否为积分购买模式
  const isCreditsMode = appConfig.purchaseMode === 'credits';

  // 计算是否有未保存的更改
  const hasChanges =
    localGeneralConfig.siteName !== generalConfig.siteName ||
    localAuthConfig.loginType !== authConfig.loginType ||
    JSON.stringify(localAuthConfig.loginTypes.sort()) !== JSON.stringify(authConfig.loginTypes.sort()) ||
    localCreditsConfig.initial_credits_enabled !== creditsConfig.initial_credits_enabled ||
    localCreditsConfig.initial_credits_amount !== creditsConfig.initial_credits_amount ||
    localCreditsConfig.initial_credits_valid_days !== creditsConfig.initial_credits_valid_days ||
    localCreditsConfig.initial_credits_description !== creditsConfig.initial_credits_description ||
    localAnalyticsConfig.googleAnalyticsId !== analyticsConfig.googleAnalyticsId;

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/configs');
      if (!response.ok) throw new Error('Failed to load configs');

      const data = await response.json();
      setConfigs(data.items || []);

      // 加载认证配置
      const loginTypeItem = data.items?.find((item: SystemConfig) => item.key === 'auth.loginType');
      const loginTypesItem = data.items?.find((item: SystemConfig) => item.key === 'auth.loginTypes');
      // 过滤掉 dev 类型
      const loadedLoginTypes = (loginTypesItem?.value || ['phone']).filter((t: string) => t !== 'dev');
      const loadedLoginType = loginTypeItem?.value === 'dev' ? 'phone' : (loginTypeItem?.value || 'phone');
      const authConfigValue = {
        loginType: loadedLoginTypes.includes(loadedLoginType) ? loadedLoginType : (loadedLoginTypes[0] || 'phone'),
        loginTypes: loadedLoginTypes.length > 0 ? loadedLoginTypes : ['phone'],
      };
      setAuthConfig(authConfigValue);
      setLocalAuthConfig(authConfigValue);

      // 加载支付配置
      const payConfigItem = data.items?.find((item: SystemConfig) => item.key === 'payment.methods');
      if (payConfigItem && Array.isArray(payConfigItem.value)) {
        setPaymentConfig(payConfigItem.value);
      } else {
        setPaymentConfig([]);
      }

      // 加载通用配置
      const siteNameItem = data.items?.find((item: SystemConfig) => item.key === 'system.siteName');
      const generalConfigValue = {
        siteName: siteNameItem?.value || DEFAULT_SITE_NAME,
      };
      setGeneralConfig(generalConfigValue);
      setLocalGeneralConfig(generalConfigValue);

      // 如果数据库中没有 siteName，自动保存默认值
      if (!siteNameItem?.value) {
        fetch('/api/admin/configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'system.siteName',
            value: DEFAULT_SITE_NAME,
            type: 'string',
            category: 'system',
            description: '网站名称',
          }),
        }).catch(err => console.error('Auto save siteName error:', err));
      }

      // 加载积分配置
      const creditsConfigItem = data.items?.find((item: SystemConfig) => item.key === 'credits.initialCredits');
      const creditsConfigValue = creditsConfigItem && creditsConfigItem.value
        ? { ...defaultCreditsConfig, ...creditsConfigItem.value }
        : defaultCreditsConfig;
      setCreditsConfig(creditsConfigValue);
      setLocalCreditsConfig(creditsConfigValue);

      // 加载统计配置
      const analyticsConfigItem = data.items?.find((item: SystemConfig) => item.key === 'analytics.googleAnalyticsId');
      const analyticsConfigValue = { googleAnalyticsId: analyticsConfigItem?.value || '' };
      setAnalyticsConfig(analyticsConfigValue);
      setLocalAnalyticsConfig(analyticsConfigValue);
    } catch (error) {
      console.error('Load configs error:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // 统一保存所有配置
  const handleSaveAll = async () => {
    if (!hasChanges) return;

    // 验证
    if (!localGeneralConfig.siteName.trim()) {
      toast.error('网站名称不能为空');
      return;
    }

    if (localAuthConfig.loginTypes.length === 0) {
      toast.error('至少需要启用一个登录方式');
      return;
    }

    if (!localAuthConfig.loginTypes.includes(localAuthConfig.loginType)) {
      toast.error('默认登录方式必须是已启用的方式');
      return;
    }

    if (localCreditsConfig.initial_credits_enabled) {
      if (localCreditsConfig.initial_credits_amount <= 0) {
        toast.error('赠送积分数额必须大于0');
        return;
      }
      if (localCreditsConfig.initial_credits_valid_days < 0) {
        toast.error('有效期不能为负数（0表示永久有效）');
        return;
      }
    }

    if (localAnalyticsConfig.googleAnalyticsId && !/^G-[A-Z0-9]+$/.test(localAnalyticsConfig.googleAnalyticsId)) {
      toast.error('Google Analytics ID 格式不正确，应为 G-XXXXXXXX 格式');
      return;
    }

    try {
      setSaving(true);

      const savePromises: Promise<Response>[] = [];

      // 保存通用配置
      if (localGeneralConfig.siteName !== generalConfig.siteName) {
        savePromises.push(
          fetch('/api/admin/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'system.siteName',
              value: localGeneralConfig.siteName,
              type: 'string',
              category: 'system',
              description: '网站名称',
            }),
          })
        );
      }

      // 保存认证配置
      if (localAuthConfig.loginType !== authConfig.loginType) {
        savePromises.push(
          fetch('/api/admin/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'auth.loginType',
              value: localAuthConfig.loginType,
              type: 'string',
              category: 'auth',
              description: '默认登录方式',
            }),
          })
        );
      }

      if (JSON.stringify(localAuthConfig.loginTypes.sort()) !== JSON.stringify(authConfig.loginTypes.sort())) {
        savePromises.push(
          fetch('/api/admin/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'auth.loginTypes',
              value: localAuthConfig.loginTypes,
              type: 'array',
              category: 'auth',
              description: '启用的登录方式',
            }),
          })
        );
      }

      // 保存积分配置
      const creditsChanged =
        localCreditsConfig.initial_credits_enabled !== creditsConfig.initial_credits_enabled ||
        localCreditsConfig.initial_credits_amount !== creditsConfig.initial_credits_amount ||
        localCreditsConfig.initial_credits_valid_days !== creditsConfig.initial_credits_valid_days ||
        localCreditsConfig.initial_credits_description !== creditsConfig.initial_credits_description;

      if (creditsChanged) {
        savePromises.push(
          fetch('/api/admin/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'credits.initialCredits',
              value: localCreditsConfig,
              type: 'object',
              category: 'credits',
              description: '新用户积分赠送配置',
            }),
          })
        );
      }

      // 保存统计配置
      if (localAnalyticsConfig.googleAnalyticsId !== analyticsConfig.googleAnalyticsId) {
        savePromises.push(
          fetch('/api/admin/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'analytics.googleAnalyticsId',
              value: localAnalyticsConfig.googleAnalyticsId,
              type: 'string',
              category: 'system',
              description: 'Google Analytics ID',
            }),
          })
        );
      }

      // 执行所有保存
      const responses = await Promise.all(savePromises);

      // 检查是否所有请求都成功
      for (const response of responses) {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '保存失败');
        }
      }

      // 更新原始配置状态
      setGeneralConfig({ ...localGeneralConfig });
      setAuthConfig({ ...localAuthConfig });
      setCreditsConfig({ ...localCreditsConfig });
      setAnalyticsConfig({ ...localAnalyticsConfig });

      toast.success('配置保存成功');
    } catch (error: any) {
      console.error('Save configs error:', error);
      toast.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 保存支付配置（支付配置仍保留即时保存）
  const handleSavePayment = async (methods: any[]) => {
    try {
      const response = await fetch('/api/admin/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'payment.methods',
          value: methods,
          type: 'array',
          category: 'payment',
          description: '支付方式配置',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save payment config');
      }

      setPaymentConfig(methods);
    } catch (error: any) {
      console.error('Save payment config error:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {/* Header with Save Button */}
      <div className="flex justify-between items-center">
        <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1">
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'general' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={16} />
            通用配置
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'auth' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            <Shield size={16} />
            认证配置
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'payment' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <CreditCard size={16} />
            支付配置
          </button>
          {isCreditsMode && (
            <button
              role="tab"
              className={`tab gap-2 ${activeTab === 'credits' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('credits')}
            >
              <Gift size={16} />
              积分配置
            </button>
          )}
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'analytics' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            统计配置
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'ai' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Bot size={16} />
            AI 配置
          </button>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            className="btn btn-primary gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存配置
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Tab Content */}
      {!loading && activeTab === 'general' && (
        <GeneralConfig
          siteName={localGeneralConfig.siteName}
          onChange={setLocalGeneralConfig}
        />
      )}

      {!loading && activeTab === 'auth' && (
        <AuthConfig
          loginType={localAuthConfig.loginType}
          loginTypes={localAuthConfig.loginTypes}
          onChange={setLocalAuthConfig}
        />
      )}

      {!loading && activeTab === 'payment' && (
        <PaymentConfig
          initialMethods={paymentConfig}
          onSave={handleSavePayment}
        />
      )}

      {!loading && activeTab === 'credits' && isCreditsMode && (
        <CreditsConfig
          config={localCreditsConfig}
          onChange={setLocalCreditsConfig}
        />
      )}

      {!loading && activeTab === 'analytics' && (
        <AnalyticsConfig
          config={localAnalyticsConfig}
          onChange={setLocalAnalyticsConfig}
        />
      )}

      {!loading && activeTab === 'ai' && (
        <AIConfig />
      )}
    </div>
  );
}
