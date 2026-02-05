'use client';
import React, { useEffect, useState } from 'react';
import { sendCode, registerUser } from '../signin/actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const VerificationButton = (props: { type: string; identifier: string }) => {
  const { type, identifier } = props;
  const [counter, setCounter] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setButtonDisabled(false);
    }
  }, [counter]);

  const handleClick = async () => {
    if (!identifier) {
      toast.error('请先输入账号');
      return;
    }
    setCounter(60);
    setButtonDisabled(true);
    const data: any = await sendCode(type, {
      identifier,
    });
    toast.success(data.message);
  };

  return (
    <button
      className="btn btn-primary btn-soft rounded-xl w-28 shrink-0 text-xs"
      onClick={() => handleClick()}
      disabled={buttonDisabled}
    >
      {buttonDisabled ? `重新获取(${counter}s)` : '获取验证码'}
    </button>
  );
};

export default function SignUpPage() {
  const router = useRouter();
  const { siteConfig } = useSiteConfig();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'phone' | 'email'>('email');
  const [form, setForm] = useState({
    identifier: '',
    code: '',
    password: '',
    confirmPassword: '',
  });

  const handleFormChange = (key: string, value: string) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleRegister = async () => {
    if (!form.identifier) {
      toast.error(type === 'email' ? '请输入邮箱!' : '请输入手机号!');
      return;
    }
    if (!form.code) {
      toast.error('请输入验证码!');
      return;
    }
    if (!form.password) {
      toast.error('请输入密码!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('密码长度至少6位!');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('两次输入的密码不一致!');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        identifier: form.identifier,
        password: form.password,
        identifierType: type,
        code: form.code,
      });

      if (result.success) {
        toast.success(result.message || '注册成功');
        router.push('/zh/auth/signin');
      } else {
        toast.error(result.error || '注册失败');
      }
    } catch (error) {
      toast.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 px-4 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col justify-center w-full max-w-[420px]">
        {/* Logo + 标题 */}
        <a href="/" className="flex flex-col items-center mb-5 group">
          <div className="w-12 h-12 rounded-2xl bg-base-100 shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              alt={siteConfig.siteName}
              src="/favicon.ico"
              className="h-8 w-8"
            />
          </div>
          <h2 className="mt-2.5 text-xl font-bold tracking-tight text-base-content">
            注册账号
          </h2>
          <p className="mt-0.5 text-sm text-base-content/50">
            创建你的 {siteConfig.siteName} 账号
          </p>
        </a>

        {/* 主卡片 */}
        <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden">
          <div className="card-body p-6 sm:p-8">
            {/* 注册类型切换 */}
            <div className="flex gap-2 mb-2">
              <button
                className={`btn btn-sm flex-1 rounded-xl transition-all ${
                  type === 'email'
                    ? 'btn-primary'
                    : 'btn-ghost border border-base-300 hover:border-primary/30 hover:bg-primary/5'
                }`}
                onClick={() => setType('email')}
              >
                <Image src="/login/邮箱.svg" alt="邮箱" width={16} height={16} className={type === 'email' ? 'brightness-0 invert' : 'opacity-50'} />
                <span className="text-xs">邮箱注册</span>
              </button>
              <button
                className={`btn btn-sm flex-1 rounded-xl transition-all ${
                  type === 'phone'
                    ? 'btn-primary'
                    : 'btn-ghost border border-base-300 hover:border-primary/30 hover:bg-primary/5'
                }`}
                onClick={() => setType('phone')}
              >
                <Image src="/login/手机.svg" alt="手机" width={16} height={16} className={type === 'phone' ? 'brightness-0 invert' : 'opacity-50'} />
                <span className="text-xs">手机号注册</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* 账号 + 验证码按钮 */}
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">
                  {type === 'email' ? '邮箱' : '手机号'}
                </label>
                <div className="flex gap-3">
                  <label className="input rounded-xl w-full focus-within:outline-primary/30">
                    <Image src={type === 'email' ? '/login/邮箱.svg' : '/login/手机.svg'} alt={type} width={16} height={16} className="opacity-40" />
                    <input
                      value={form.identifier}
                      type="text"
                      placeholder={type === 'email' ? '请输入邮箱' : '请输入手机号'}
                      onChange={(e) => handleFormChange('identifier', e.target.value)}
                    />
                  </label>
                  <VerificationButton type={type} identifier={form.identifier} />
                </div>
              </div>

              {/* 验证码 */}
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">验证码</label>
                <label className="input rounded-xl w-full focus-within:outline-primary/30">
                  <Image src="/login/邮箱.svg" alt="验证码" width={16} height={16} className="opacity-40" />
                  <input
                    value={form.code}
                    type="text"
                    placeholder="请输入验证码"
                    onChange={(e) => handleFormChange('code', e.target.value)}
                  />
                </label>
              </div>

              {/* 密码 */}
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">密码</label>
                <label className="input rounded-xl w-full focus-within:outline-primary/30">
                  <Image src="/login/账号.svg" alt="密码" width={16} height={16} className="opacity-40" />
                  <input
                    value={form.password}
                    type="password"
                    placeholder="请输入密码（至少6位）"
                    onChange={(e) => handleFormChange('password', e.target.value)}
                  />
                </label>
              </div>

              {/* 确认密码 */}
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">确认密码</label>
                <label className="input rounded-xl w-full focus-within:outline-primary/30">
                  <Image src="/login/账号.svg" alt="确认密码" width={16} height={16} className="opacity-40" />
                  <input
                    value={form.confirmPassword}
                    type="password"
                    placeholder="请再次输入密码"
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                  />
                </label>
              </div>

              {/* 注册按钮 */}
              <button
                className="btn btn-primary w-full rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                onClick={() => handleRegister()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </button>

              {/* 登录链接 */}
              <div className="text-center">
                <Link
                  href="/zh/auth/signin"
                  className="text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  已有账号？立即登录
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-4 text-center">
          <span className="text-xs text-base-content/40">
            注册后可使用账号密码登录
          </span>
        </div>
      </div>
    </div>
  );
}
