'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { sendCode } from './actions';
import { config } from '@/config';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import WxChatPc from '@/components/weChat/WeChatPc';
import WeChatMobile from '@/components/weChat/WeChatMobile';

const LOGIN_HASH = {
  wx: '💬 微信登录',
  phone: '📱 手机登录',
  email: '📫 邮箱登录',
};

const WeChatLogin = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="text-center py-4">
        <WeChatMobile />
        <p className="mt-4 text-sm text-gray-500">点击按钮后跳转微信</p>
      </div>
    );
  }

  return <WxChatPc />;
};

const VerificationButton = (props: { type: string; form: { identifier: string; code: string } }) => {
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
  const [type, setType] = useState(config.loginType);
  const [form, setForm] = useState({
    identifier: '',
    code: '',
  });
  const searchParams = useSearchParams();

  const handleFormChnage = (key: string, value: string) => {
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
      const callbackUrl = searchParams.get('redirect') || '/';
      router.push(callbackUrl);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-slate-100">
      <div className="flex flex-col justify-center w-full max-w-[480px] px-4">
        <a href="/" className="mx-auto">
          <img
            alt="Your Company"
            src="/brand/logo.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Mvp Fast
          </h2>
        </a>

        <div className="mt-10">
          <div className="bg-white px-6 py-8 shadow-sm sm:rounded-lg sm:px-12">
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
              <WeChatLogin />
            )}

            <div>
              {
                config.loginTypes.length > 1 && (
                  <div className="relative mt-10">
                    <div className="divider">或者</div>
                  </div>
                )
              }

              <div className="mt-6 flex justify-between gap-4">
                {config.loginTypes.map((item) => (
                  <React.Fragment key={item}>
                    {type !== item && (
                      <button
                        className="btn flex-1"
                        onClick={() => setType(item)}
                      >
                        {LOGIN_HASH[item as keyof typeof LOGIN_HASH]}
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
