'use client';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import { get } from '@/app/services/index';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { sendCode, createQrCode, checkQrCode } from './actions';
import { config } from '@/config';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import WxChatPc from '@/components/weChat/WeChatPc';
import WeChatMobile from '@/components/weChat/WeChatMobile';
import { sendOTPEmail, verifyOTP } from '@/lib/supabase';

const LOGIN_HASH = {
  supabase: '📧 Supabase登录',
};

const VerificationButton = (props: { onClick: () => Promise<void> }) => {
  const { onClick } = props;
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
    setCounter(60);
    setButtonDisabled(true);
    try {
      await onClick();
    } catch (error) {
      setCounter(0);
      setButtonDisabled(false);
    }
  };

  return (
    <button
      className="btn btn-primary w-32"
      onClick={handleClick}
      disabled={buttonDisabled}
    >
      {buttonDisabled ? `重新获取(${counter}s)` : '获取验证码'}
    </button>
  );
};

export default function SignInPage() {
  const router = useRouter();
  const [type, setType] = useState(config.loginType);
  const [form, setForm] = useState({
    identifier: '',
    code: '',
  });
  const searchParams = useSearchParams();
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleFormChnage = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleLogin = async () => {
    if (!form.identifier) {
      toast.error('请输入邮箱!');
      return;
    }
    if (!form.code) {
      toast.error('请输入验证码!');
      return;
    }

    try {
      const res = await signIn('supabase', {
        email: form.identifier,
        token: form.code,
        redirect: false,
      });

      if (res?.error) {
        toast.error('验证码错误，请重新输入');
      } else {
        const callbackUrl = searchParams.get('redirect') || '/';
        router.push(callbackUrl);
      }
    } catch (error: any) {
      toast.error('验证失败，请重试');
    }
  };

  const handleSendOTP = async () => {
    if (!supabaseEmail) {
      toast.error('请输入邮箱');
      return;
    }

    try {
      await sendOTPEmail(supabaseEmail);
      setOtpSent(true);
      toast.success('验证码已发送到邮箱');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
    }
  };

  const handleSupabaseLogin = async () => {
    if (!supabaseEmail || !otpCode) {
      toast.error('请输入邮箱和验证码');
      return;
    }

    try {
      const res = await signIn('supabase', {
        email: supabaseEmail,
        token: otpCode,
        redirect: false,
      });

      if (res?.error) {
        toast.error('登录失败: ' + res.error);
      } else {
        const callbackUrl = searchParams.get('redirect') || '/';
        router.push(callbackUrl);
      }
    } catch (error: any) {
      toast.error(error.message || '验证失败');
    }
  };

  const handleSendCode = async () => {
    if (!form.identifier) {
      toast.error('请输入邮箱');
      return;
    }

    try {
      await sendOTPEmail(form.identifier);
      setOtpSent(true);
      toast.success('验证码已发送到邮箱');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
      throw error; // 抛出错误以触发按钮重置
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-slate-100">
      <div className="flex flex-col justify-center w-full max-w-[480px] px-4">
        <a href="/" className="mx-auto">
          <img
            alt="Your Company"
            src="/logo.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Mvp Fast
          </h2>
        </a>

        <div className="mt-10">
          <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
            {type === 'email' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    邮箱
                  </label>
                  <div className="mt-2 flex flex-row gap-4">
                    <input
                      type="email"
                      placeholder="请输入邮箱"
                      className="input input-bordered w-full"
                      value={form.identifier}
                      onChange={(e) =>
                        handleFormChnage('identifier', e.target.value)
                      }
                    />
                    <VerificationButton onClick={handleSendCode} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    验证码
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="请输入验证码"
                      className="input input-bordered w-full"
                      value={form.code}
                      onChange={(e) => handleFormChnage('code', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleLogin}
                  >
                    登录
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="relative mt-10">
                <div className="divider">或者</div>
              </div>

              <div className="mt-6 flex justify-between gap-4">
                {config.loginTypes.map((item) => (
                  <React.Fragment key={item}>
                    {type !== item && (
                      <button
                        className="btn flex-1"
                        onClick={() => setType(item)}
                      >
                        {LOGIN_HASH[item]}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center flex gap-4 justify-center">
            <span className="text-sm text-secondary">
              第一次登录时会创建帐号，并且会生成有趣的昵称💡
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
