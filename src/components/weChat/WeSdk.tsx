'use client';
import { useEffect } from 'react';
import Script from 'next/script';

function WeSdk() {
  useEffect(() => {
    // 在这里初始化微信SDK
    if (typeof window !== 'undefined' && window.wx) {
      window.wx.config({
        debug: true, // 开启调试模式
        appId: process.env.NEXT_PUBLIC_WECHAT_APPID, // 必填，公众号的唯一标识
        timestamp: new Date().getTime(), // 必填，生成签名的时间戳
        nonceStr: 'mvpfast-wechat-sdk', // 必填，生成签名的随机串
        signature: 'mvpfast', // 必填，签名
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'], // 必填，需要使用的JS接口列表
      });

      window.wx.ready(() => {
        console.log('微信SDK初始化成功');
      });

      window.wx.error((res) => {
        console.error('微信SDK初始化失败', res);
      });
    }
  }, []);

  return (
    <>
      <Script
        src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"
        strategy="beforeInteractive"
      />
    </>
  );
}

export default WeSdk;
