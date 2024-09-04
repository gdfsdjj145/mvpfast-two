'use client';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import { get } from '@/app/services/index';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { sendCode, createQrCode, checkQrCode } from './actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const WxCode = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  let timer: any = null;
  const [codeState, setCodeState] = useState({
    ticket: '',
    qrcode: '',
  });
  const [loading, setLoading] = useState(true);
  const hasRunEffect = useRef(false);

  const getWxQrCode = async () => {
    if (hasRunEffect.current) return; // 如果已经执行过，直接返回
    hasRunEffect.current = true; // 标记为已执行

    setLoading(true);
    const data = await get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/getWxQrCode`
    );
    createQrCode(data.ticket);
    pollQrCode(data.ticket);
    setCodeState(data);
    setLoading(false);
  };

  const pollQrCode = async (ticket: string) => {
    timer = setInterval(async () => {
      const data: any = await checkQrCode(ticket);
      if (data.isScan) {
        clearInterval(timer);
        timer = null;
        const res = await signIn('credentials', {
          type: 'wx',
          identifier: data.openId,
          redirect: false,
        });
        if (res?.error) {
          toast.error(res?.error);
        } else {
          const callbackUrl = searchParams.get('callbackUrl') || '/';
          router.push(callbackUrl);
        }
      }
    }, 2000);
  };

  useEffect(() => {
    getWxQrCode();
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return (
    <Suspense>
      <figure className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mr-2"></div>
              <span>加载中...</span>
            </div>
          </div>
        )}
        {codeState.ticket ? (
          <img src={codeState.qrcode} alt="wx-code" className="w-full h-auto" />
        ) : (
          <div className="p-10 text-center">获取微信登录二维码中...</div>
        )}
      </figure>
    </Suspense>
  );
};

const VerificationButton = (props) => {
  const { type, form } = props;
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
    // 开始倒计时
    setCounter(60);
    setButtonDisabled(true);
    // 生成验证码或其他操作
    const data: any = await sendCode(type, {
      identifier: form.identifier,
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

export default function SignInPage() {
  const router = useRouter();
  const [type, setType] = useState('wx');
  const [form, setForm] = useState({
    identifier: '',
    code: '',
  });

  const handleFormChnage = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleLogin = async () => {
    if (!form.identifier || !form.code) {
      toast.error('请输入正确验证码或邮箱!');
      return;
    }
    const res = await signIn('credentials', {
      type,
      ...form,
      redirect: false,
    });
    if (res?.error) {
      toast.error(res?.error);
    } else {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(callbackUrl);
    }
  };

  return (
    <div className="relative h-svh w-full flex justify-center items-center bg-slate-100">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="Your Company"
            src="/logo.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Mvp Fast
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            {type !== 'wx' && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    {type === 'email' ? '邮箱' : '手机号'}
                  </label>
                  <div className="mt-2 flex gap-4">
                    <input
                      value={form.identifier}
                      type="text"
                      placeholder={
                        type === 'email' ? '请输入邮箱' : '请输入手机号'
                      }
                      className="input input-bordered w-full"
                      onChange={(e) =>
                        handleFormChnage('identifier', e.target.value)
                      }
                    />
                    <VerificationButton
                      form={form}
                      type={type}
                    ></VerificationButton>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    验证码
                  </label>
                  <div className="mt-2">
                    <input
                      value={form.code}
                      type="text"
                      placeholder="请填写验证码"
                      className="input input-bordered w-full"
                      onChange={(e) => handleFormChnage('code', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => handleLogin()}
                  >
                    登录
                  </button>
                </div>
              </div>
            )}

            {type === 'wx' && (
              <div className="card bg-base-100 w-80 shadow-xl mx-auto">
                <WxCode></WxCode>
                <div className="card-body gap-3">
                  <h2 className="card-title justify-center">
                    请使用微信扫码登录
                  </h2>
                </div>
              </div>
            )}

            <div>
              <div className="relative mt-10">
                <div className="divider">或者</div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {type !== 'phone' && (
                  <button className="btn" onClick={() => setType('phone')}>
                    📱 手机登录
                  </button>
                )}

                {type !== 'email' && (
                  <button className="btn" onClick={() => setType('email')}>
                    📫 邮箱
                  </button>
                )}

                {type !== 'wx' && (
                  <button className="btn" onClick={() => setType('wx')}>
                    💬 微信登录
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center flex gap-4 justify-center">
            <span className="text-sm text-primary">
              第一次登录时会创建帐号，并且会生成有趣的昵称💡
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
