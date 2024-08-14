'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { get } from '@/app/services/index';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { createQrCode, checkQrCode } from './actions';

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

export default function SignInPage() {
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
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  邮箱
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="请填写邮箱"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  密码
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    placeholder="请填写密码"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div>
                <button className="btn btn-primary w-full">登录</button>
              </div>
            </form>

            <div>
              <div className="relative mt-10">
                <div className="divider">或者</div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="btn">📱 手机登录</button>

                <button className="btn">💬 微信登录</button>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center flex gap-4 justify-center">
            <button className="btn btn-link">忘记密码</button>
            <button className="btn btn-link">去注册</button>
          </div>
        </div>
      </div>
    </div>
  );
}
