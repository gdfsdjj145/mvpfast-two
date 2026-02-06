'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    WxLogin: new (config: {
      self_redirect?: boolean;
      id: string;
      appid: string;
      scope: string;
      redirect_uri: string;
      state?: string;
      style?: 'black' | 'white';
      href?: string;
      fast_login?: boolean | number
      onReady?: (isReady: boolean) => void;
    }) => void;
  }
}

// 生成随机 state 用于防 CSRF 攻击
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const WeChatPc = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initCalledRef = useRef(false);

  const initWxLogin = useCallback(() => {
    if (initCalledRef.current) return;

    if (!window.WxLogin) {
      setError('微信登录SDK加载失败');
      setLoading(false);
      return;
    }

    initCalledRef.current = true;
    const appid = process.env.NEXT_PUBLIC_WECHAT_OPEN_APPID;
    const domain = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUri = encodeURIComponent(`${domain}/api/wx/callback`);
    const state = `open_${generateState()}`;

    try {
      new window.WxLogin({
        self_redirect: false,
        id: 'wx_login_container',
        appid: appid || '',
        scope: 'snsapi_login',
        redirect_uri: redirectUri,
        state: state,
        style: 'black',
        href: `${domain}/css/wxlogin.css`,
        onReady: function (isReady: boolean) {
          if (isReady) {
            setLoading(false);
          } else {
            setError('二维码加载失败，请刷新重试');
            setLoading(false);
          }
        },
      });
    } catch (err) {
      console.error('WxLogin init error:', err);
      setError('微信登录初始化失败');
      setLoading(false);
    }
  }, []);

  // 当脚本加载完成后初始化
  useEffect(() => {
    if (scriptLoaded) {
      initWxLogin();
    }
  }, [scriptLoaded, initWxLogin]);

  return (
    <>
      <Script
        src="https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setError('微信登录SDK加载失败');
          setLoading(false);
        }}
      />
      <div className="relative h-[180px] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-base-100 flex justify-center items-center z-10">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-2 text-sm text-base-content/50">加载中...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-base-100 flex justify-center items-center z-10">
            <div className="text-center text-error">
              <p>{error}</p>
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => window.location.reload()}
              >
                刷新重试
              </button>
            </div>
          </div>
        )}
        <div
          id="wx_login_container"
          ref={containerRef}
          className="flex justify-center"
        />
      </div>
    </>
  );
};

export default WeChatPc;
