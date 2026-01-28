'use client';
import React, { useEffect, useState } from 'react';
import { sendCode, registerUser } from '../signin/actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const REGISTER_TYPE_HASH = {
  phone: '📱 手机号注册',
  email: '📫 邮箱注册',
};

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
    // 开始倒计时
    setCounter(60);
    setButtonDisabled(true);
    // 生成验证码或其他操作
    const data: any = await sendCode(type, {
      identifier,
    });

    toast.success(data.message);
  };

  return (
    <button
      className="btn btn-active btn-primary w-32"
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
    <div className="h-screen w-full flex justify-center items-center bg-slate-100">
      <div className="flex flex-col justify-center w-full max-w-[480px] px-4">
        <a href="/" className="mx-auto">
          <img
            alt={siteConfig.siteName}
            src="/favicon.ico"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            注册账号
          </h2>
        </a>

        <div className="mt-10">
          <div className="bg-white px-6 py-8 shadow-sm sm:rounded-lg sm:px-12">
            {/* 注册类型切换 */}
            <div className="flex gap-2 mb-6">
              <button
                className={`btn flex-1 ${type === 'email' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setType('email')}
              >
                {REGISTER_TYPE_HASH.email}
              </button>
              <button
                className={`btn flex-1 ${type === 'phone' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setType('phone')}
              >
                {REGISTER_TYPE_HASH.phone}
              </button>
            </div>

            <div className="space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {type === 'email' ? '邮箱' : '手机号'}
                </legend>
                <div className="flex gap-4">
                  <input
                    value={form.identifier}
                    type="text"
                    placeholder={type === 'email' ? '请输入邮箱' : '请输入手机号'}
                    className="input w-full"
                    onChange={(e) => handleFormChange('identifier', e.target.value)}
                  />
                  <VerificationButton type={type} identifier={form.identifier} />
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">验证码</legend>
                <input
                  value={form.code}
                  type="text"
                  placeholder="请输入验证码"
                  className="input w-full"
                  onChange={(e) => handleFormChange('code', e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">密码</legend>
                <input
                  value={form.password}
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  className="input w-full"
                  onChange={(e) => handleFormChange('password', e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">确认密码</legend>
                <input
                  value={form.confirmPassword}
                  type="password"
                  placeholder="请再次输入密码"
                  className="input w-full"
                  onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                />
              </fieldset>

              <div>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => handleRegister()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      注册中...
                    </>
                  ) : (
                    '注册'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/zh/auth/signin"
                  className="text-sm text-primary hover:underline"
                >
                  已有账号？立即登录
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center flex gap-4 justify-center">
            <span className="text-sm text-secondary">
              注册后可使用账号密码登录
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
