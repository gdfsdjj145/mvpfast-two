'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { get } from '@/app/services/index';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { sendCode, createQrCode, checkQrCode } from './actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const WxCode = () => {
  let timer: any = null;
  const [codeState, setCodeState] = useState({
    ticket: '',
    qrcode: '',
  });
  const urlParams = useSearchParams();
  const callback = urlParams.get('callbackUrl') || '/dashboard';

  const getWxQrCode = async () => {
    const data = await get(
      'https://express-sjle-115303-5-1328029634.sh.run.tcloudbase.com/api/getWxQrCode'
    );
    createQrCode(data.ticket);
    pollQrCode(data.ticket);
    setCodeState(data);
  };

  const pollQrCode = async (ticket: string) => {
    timer = setInterval(async () => {
      const data = await checkQrCode(ticket);
      if (data.isScan) {
        clearInterval(timer);
        timer = null;
        const nexttime = dayjs().add(1, 'day').unix();
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.openId,
            expires: nexttime,
          })
        );
        window.location.href = callback;
      }
    }, 1500);
  };

  useEffect(() => {
    // getWxQrCode();
  }, []);
  return (
    <Suspense>
      <figure>
        {codeState.ticket ? (
          <img src={codeState.qrcode} alt="wx-code" />
        ) : (
          <div className="p-40">loading...</div>
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

    toast.success(data.msg);
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
  const [type, setType] = useState('email');
  const [form, setForm] = useState({
    identifier: '929932952@qq.com',
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
      router.push('/'); // 登录成功后跳转到 /
    }
  };

  return (
    <div className="relative h-svh w-full flex justify-center items-center bg-slate-100">
      {/* <div className="card bg-base-100 w-96 shadow-xl">
        <WxCode></WxCode>
        <div className="card-body gap-3">
          <h2 className="card-title justify-center">请使用微信扫码登录</h2>
        </div>
      </div> */}
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="Your Company"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Mvp Fast
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
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
                    placeholder="请填写邮箱"
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
              第一次登录时会创建帐号💡
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
