'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

const generateOAuthUrl = (redirectUri: string, state: string = ''): string => {
  const params = new URLSearchParams({
    appid: process.env.NEXT_PUBLIC_WECHAT_APPID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state: state,
  });
  return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;
};
const WeChatMobile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleWxLogin = async () => {
    // 获取当前域名
    const currentDomain = window.location.origin;
    const authUrl = generateOAuthUrl(`${currentDomain}/api/wx/callback`);

    window.location.href = authUrl;
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

    const checkLogin = async (id: string) => {
      setIsLoading(true);
      try {
        const res = await signIn('credentials', {
          type: 'wx',
          identifier: id,
          redirect: false,
        });
        if (res?.error) {
          toast.error(res?.error);
        } else {
          const callbackUrl = searchParams.get('redirect') || '/';
          window.location.href = callbackUrl;
        }
      } catch (error) {
        toast.error('登录失败，请重试');
      } finally {
        setIsLoading(false);
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
        disabled={isLoading}
        className={`
          relative w-full py-3 px-4 
          flex items-center justify-center gap-3
          text-white text-lg font-medium
          bg-[#07C160] hover:bg-[#06ad55] 
          rounded-lg shadow-md hover:shadow-lg
          transform transition-all duration-200 
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isLoading ? 'animate-pulse' : 'hover:-translate-y-0.5'}
        `}
      >
        {isLoading ? (
          <span className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-7 h-7"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M692.375407 346.694815c4.716148 0 9.360938 0.347971 13.993938 0.869926-31.402667-146.468741-188.016593-255.054222-366.865185-255.054222C152.613926 92.510519 0 221.688889 0 383.770074c0 93.585067 51.086222 170.475852 136.491852 230.172444l-34.133333 102.660741 119.365926-59.797333c42.775704 8.456533 77.169778 17.083259 119.945481 17.083259 10.734815 0 21.381926-0.521481 31.881482-1.347582-6.690133-22.881185-10.561185-46.88237-10.561185-71.802074C362.990222 461.161481 508.056889 346.694815 692.375407 346.694815zM499.735704 248.685037c25.699556 0 42.782815 16.909748 42.782815 42.609185 0 25.592889-17.083259 42.775704-42.782815 42.775704-25.592889 0-51.185778-17.182815-51.185778-42.775704C448.549926 265.594785 474.142815 248.685037 499.735704 248.685037zM267.636148 334.070519c-25.592889 0-51.358815-17.182815-51.358815-42.775704 0-25.699556 25.765926-42.609185 51.358815-42.609185 25.592889 0 42.677037 16.909748 42.677037 42.609185C310.313185 316.887704 293.229037 334.070519 267.636148 334.070519zM1024 629.57037c0-136.404148-136.491852-247.854222-289.892741-247.854222-162.372741 0-290.258963 111.450074-290.258963 247.854222 0 136.697481 127.886222 247.854222 290.258963 247.854222 34.047704 0 68.181333-8.456533 102.315852-17.083259l93.492148 51.358815-25.592889-85.477926C972.913778 774.940444 1024 706.759111 1024 629.57037zM618.379852 586.787556c-17.083259 0-34.340741-16.909748-34.340741-34.340741 0-17.083259 17.257481-34.340741 34.340741-34.340741 25.786074 0 42.695111 17.257481 42.695111 34.340741C661.074963 569.877807 644.165926 586.787556 618.379852 586.787556zM800.056889 586.787556c-17.083259 0-34.167111-16.909748-34.167111-34.340741 0-17.083259 17.083259-34.340741 34.167111-34.340741 25.592889 0 42.782815 17.257481 42.782815 34.340741C842.839704 569.877807 825.649778 586.787556 800.056889 586.787556z"
            />
          </svg>
        )}
        <span className="inline-block min-w-[4em]">
          {isLoading ? '登录中...' : '微信登录'}
        </span>
      </button>
    </div>
  );
};

export default WeChatMobile;
