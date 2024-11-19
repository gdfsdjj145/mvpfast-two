'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import axios from 'axios';

const generateOAuthUrl = (redirectUri: string, state: string = ''): string => {
  const params = new URLSearchParams({
    appid: process.env.NEXT_PUBLIC_WECHAT_APPID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state: '',
  });
  return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;
};
const WeChatMobile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleWxLogin = async () => {
    // const authUrl = generateOAuthUrl('https://www.mvpfast.top/api/wx/callback');
    // window.location.href = authUrl;
    axios.get('/api/wx/callback');
  };

  // 检查是否在微信浏览器中
  const isWxClient = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
  };

  useEffect(() => {
    // 检查 URL 参数中是否有 code
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    const checkLogin = async (id) => {
      const res = await signIn('credentials', {
        type: 'wx',
        identifier: id,
        redirect: false,
      });
      console.log(res);
      if (res?.error) {
        toast.error(res?.error);
      } else {
        const callbackUrl = searchParams.get('redirect') || '/';
        window.location.href = callbackUrl;
      }
    };

    if (id && type === 'wxlogin') {
      checkLogin(id);
    }
  }, [searchParams, router]); // 依赖项包含 searchParams 和 router

  return (
    <div className="w-full p-4 flex flex-col items-center">
      <button
        onClick={handleWxLogin}
        className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.07,16a2.5,2.5,0,0,1-1.47-.47L4,16l.61-2a6,6,0,0,1-2-4.49C2.6,6.07,4.93,4,7.78,4h.27a6.08,6.08,0,0,1,5.22,4.79h-.44c-3,0-5.43,2.23-5.43,5a4.51,4.51,0,0,0,.67,2.49Z" />
          <path d="M17.94,20a2.06,2.06,0,0,1-1.21-.41L14,20l.41-1.4a4.32,4.32,0,0,1-1.69-3.22c0-2.73,2.63-4.95,5.87-4.95s5.87,2.22,5.87,4.95-2.63,4.95-5.87,4.95Z" />
        </svg>
        微信登录
      </button>
    </div>
  );
};

export default WeChatMobile;
