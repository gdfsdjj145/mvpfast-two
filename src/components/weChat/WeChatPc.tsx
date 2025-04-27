import React, { useEffect, useState, Suspense, useRef } from 'react';
import { get } from '@/app/services/index';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { createQrCode, checkQrCode } from '@/app/[local]/auth/signin/actions';
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/getWxQrCode?key=1000`
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
        console.log(res);
        if (res?.error) {
          toast.error(res?.error);
        } else {
          const callbackUrl = searchParams.get('redirect') || '/';
          window.location.href = callbackUrl;
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

export default WxCode;
