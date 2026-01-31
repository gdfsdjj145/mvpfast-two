'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { sendCode } from './actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import WxChatPc from '@/components/weChat/WeChatPc';
import WeChatMobile from '@/components/weChat/WeChatMobile';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchPublicConfigs, selectLoginConfig, selectPublicConfigLoaded } from '@/store/publicConfig';

const LOGIN_HASH: Record<string, string> = {
  wx: '微信登录',
  phone: '手机登录',
  email: '邮箱登录',
  password: '密码登录',
};

const LOGIN_ICON_SRC: Record<string, string> = {
  wx: '/login/微信.svg',
  phone: '/login/手机.svg',
  email: '/login/邮箱.svg',
  password: '/login/账号.svg',
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
        <p className="mt-4 text-sm text-base-content/50">点击按钮后跳转微信</p>
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
    setCounter(60);
    setButtonDisabled(true);
    const data: any = await sendCode(type, {
      identifier: form.identifier,
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

export default function SignInPage() {
  const { siteConfig } = useSiteConfig();
  const { update } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loginConfig = useAppSelector(selectLoginConfig);
  const configLoaded = useAppSelector(selectPublicConfigLoaded);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: '',
    code: '',
    password: '',
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(fetchPublicConfigs());
  }, [dispatch]);

  useEffect(() => {
    if (configLoaded && !type) {
      setType(loginConfig.loginType);
    }
  }, [configLoaded, loginConfig.loginType, type]);

  const handleFormChnage = (key: string, value: string) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleLogin = async () => {
    if (!form.identifier) {
      toast.error('请输入账号!');
      return;
    }

    if (type === 'password') {
      if (!form.password) {
        toast.error('请输入密码!');
        return;
      }
      setLoading(true);
      const res = await signIn('credentials', {
        type: 'password',
        identifier: form.identifier,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error('账号或密码错误');
        setLoading(false);
      } else {
        await update();
        const callbackUrl = searchParams.get('redirect') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
      return;
    }

    if (!form.code) {
      toast.error('请输入验证码!');
      return;
    }
    setLoading(true);
    const res = await signIn('credentials', {
      type,
      identifier: form.identifier,
      code: form.code,
      redirect: false,
    });
    if (res?.error) {
      toast.error(res?.error);
      setLoading(false);
    } else {
      await update();
      const callbackUrl = searchParams.get('redirect') || '/';
      router.push(callbackUrl);
      router.refresh();
    }
  };

  if (!configLoaded) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const isCodeLogin = type === 'phone' || type === 'email';
  const isPasswordLogin = type === 'password';

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
            {siteConfig.siteName}
          </h2>
          <p className="mt-0.5 text-sm text-base-content/50">
            {isPasswordLogin ? '使用账号密码登录' : '欢迎回来'}
          </p>
        </a>

        {/* 主卡片 */}
        <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden">
          <div className="card-body p-6 sm:p-8">
            {/* 密码登录表单 */}
            {isPasswordLogin && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70 mb-1 block">账号</label>
                  <label className="input rounded-xl w-full focus-within:outline-primary/30">
                    <Image src="/login/账号.svg" alt="账号" width={16} height={16} className="opacity-40" />
                    <input
                      value={form.identifier}
                      type="text"
                      placeholder="请输入邮箱或手机号"
                      onChange={(e) =>
                        handleFormChnage('identifier', e.target.value)
                      }
                    />
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-base-content/70 mb-1 block">密码</label>
                  <label className="input rounded-xl w-full focus-within:outline-primary/30">
                    <Image src="/login/账号.svg" alt="密码" width={16} height={16} className="opacity-40" />
                    <input
                      value={form.password}
                      type="password"
                      placeholder="请输入密码"
                      onChange={(e) => handleFormChnage('password', e.target.value)}
                    />
                  </label>
                </div>

                <button
                  className="btn btn-primary w-full rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                  onClick={() => handleLogin()}
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner loading-sm"></span>}
                  登录
                </button>

                <div className="text-center">
                  <Link
                    href="/zh/auth/signup"
                    className="text-sm text-primary/80 hover:text-primary transition-colors"
                  >
                    没有账号？立即注册
                  </Link>
                </div>
              </div>
            )}

            {/* 验证码登录表单 */}
            {isCodeLogin && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70 mb-1 block">
                    {type === 'email' ? '邮箱' : '手机号'}
                  </label>
                  <div className="flex gap-3">
                    <label className="input rounded-xl w-full focus-within:outline-primary/30">
                      <Image src={type === 'email' ? '/login/邮箱.svg' : '/login/手机.svg'} alt={type === 'email' ? '邮箱' : '手机'} width={16} height={16} className="opacity-40" />
                      <input
                        value={form.identifier}
                        type="text"
                        placeholder={
                          type === 'email' ? '请输入邮箱' : '请输入手机号'
                        }
                        onChange={(e) =>
                          handleFormChnage('identifier', e.target.value)
                        }
                      />
                    </label>
                    <VerificationButton
                      form={form}
                      type={type}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-base-content/70 mb-1 block">验证码</label>
                  <label className="input rounded-xl w-full focus-within:outline-primary/30">
                    <Image src="/login/邮箱.svg" alt="验证码" width={16} height={16} className="opacity-40" />
                    <input
                      value={form.code}
                      type="text"
                      placeholder="请填写验证码"
                      onChange={(e) => handleFormChnage('code', e.target.value)}
                    />
                  </label>
                </div>

                <button
                  className="btn btn-primary w-full rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                  onClick={() => handleLogin()}
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner loading-sm"></span>}
                  登录
                </button>
              </div>
            )}

            {type === 'wx' && (
              <WeChatLogin />
            )}

            {/* 其他登录方式 */}
            {loginConfig.loginTypes.length > 1 && (
              <>
                <div className="divider text-base-content/30 text-xs my-4">其他登录方式</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {loginConfig.loginTypes.map((item) => (
                    <React.Fragment key={item}>
                      {type !== item && (
                        <button
                          className="btn btn-ghost btn-sm rounded-xl flex-1 min-w-[110px] border border-base-300 hover:border-primary/30 hover:bg-primary/5 transition-all"
                          onClick={() => setType(item)}
                        >
                          <span className="flex items-center gap-1.5">
                            <Image src={LOGIN_ICON_SRC[item]} alt={LOGIN_HASH[item]} width={18} height={18} />
                            <span className="text-xs">{LOGIN_HASH[item]}</span>
                          </span>
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-4 text-center">
          <span className="text-xs text-base-content/40">
            {isPasswordLogin ? '使用邮箱或手机号登录' : '第一次登录时会创建帐号，并且会生成有趣的昵称'}
          </span>
        </div>
      </div>
    </div>
  );
}
