'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Gift, BarChart3, Bot, Save, CircleAlert, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
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

// Tab 配置
const TABS = [
  { key: 'general' as TabType, label: '通用配置', icon: Settings, description: '网站基本信息设置' },
  { key: 'auth' as TabType, label: '认证配置', icon: Shield, description: '登录方式管理' },
  { key: 'payment' as TabType, label: '支付配置', icon: CreditCard, description: '支付渠道管理' },
  { key: 'credits' as TabType, label: '积分配置', icon: Gift, description: '积分规则设置', creditsOnly: true },
  { key: 'analytics' as TabType, label: '统计配置', icon: BarChart3, description: '数据统计服务' },
  { key: 'ai' as TabType, label: 'AI 配置', icon: Bot, description: 'AI 服务配置' },
];

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

  // 获取当前活动 Tab 的信息
  const activeTabInfo = TABS.find(t => t.key === activeTab);

  // 过滤可见的 tabs
  const visibleTabs = TABS.filter(tab => !tab.creditsOnly || isCreditsMode);

  return (
    <div className="space-y-6">
      {/* Tab Navigation + Save Button */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-2">
        <div className="flex items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'bg-primary text-primary-content shadow-md'
                      : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? '' : 'opacity-70'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {hasChanges && (
              <div className="hidden md:flex items-center gap-1.5 text-warning text-sm">
                <CircleAlert size={14} />
                <span>未保存</span>
              </div>
            )}
            <button
              onClick={handleSaveAll}
              className={`btn btn-sm gap-1.5 transition-all duration-200 ${
                hasChanges
                  ? 'btn-primary shadow-md hover:shadow-lg'
                  : 'btn-ghost btn-disabled opacity-50'
              }`}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="hidden sm:inline">保存中</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span className="hidden sm:inline">保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Tab Description */}
      {activeTabInfo && !loading && (
        <div className="flex items-center gap-2 text-sm text-base-content/60 -mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          {activeTabInfo.description}
        </div>
      )}

      {/* Loading State - 骨架屏 */}
      {loading && (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-base-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card bg-base-100 shadow">
                <div className="card-body p-6">
                  <div className="h-5 bg-base-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-base-200 rounded w-full"></div>
                    <div className="h-10 bg-base-200 rounded w-full"></div>
                    <div className="h-3 bg-base-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow">
                <div className="card-body p-6">
                  <div className="h-5 bg-base-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-base-200 rounded w-full"></div>
                    <div className="h-10 bg-base-200 rounded w-full"></div>
                    <div className="h-3 bg-base-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className={loading ? 'hidden' : ''}>
        {activeTab === 'general' && (
          <GeneralConfig
            siteName={localGeneralConfig.siteName}
            onChange={setLocalGeneralConfig}
          />
        )}

        {activeTab === 'auth' && (
          <AuthConfig
            loginType={localAuthConfig.loginType}
            loginTypes={localAuthConfig.loginTypes}
            onChange={setLocalAuthConfig}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentConfig />
        )}

        {activeTab === 'credits' && isCreditsMode && (
          <CreditsConfig
            config={localCreditsConfig}
            onChange={setLocalCreditsConfig}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsConfig
            config={localAnalyticsConfig}
            onChange={setLocalAnalyticsConfig}
          />
        )}

        {activeTab === 'ai' && (
          <AIConfig />
        )}
      </div>
    </div>
  );
}
