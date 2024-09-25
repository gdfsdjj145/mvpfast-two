import React from 'react';
import Link from 'next/link';

export default function HeroComponent() {
  return (
    <div>
      <section id="hero" className=" flex  justify-center bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
            <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start lg:w-1/2">
              <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 flex flex-col gap-3 items-center lg:items-start">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ">
                  使用最短的时间
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 ">
                  上线网站应用
                </span>
              </h1>
              <p
                className="text-lg text-gray-600 leading-relaxed "
                style={{ animationDelay: '0.3s' }}
              >
                手把手教你从0到1完成Nextjs全栈开发，从编程小白进阶到全栈开发者，让你学会独自开发项目并上线
              </p>
              <div className="space-y-4 " style={{ animationDelay: '0.6s' }}>
                <Link
                  href="/#price"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  获取模板
                </Link>
                <p className="text-sm text-gray-500 flex justify-center items-center gap-2 md:text-sm">
                  🛒前100名购买用户，可享作者全程技术服务🚀
                </p>
              </div>
              <p className="text-xl font-bold text-purple-600 animate-bounce">
                立即购买，开启您的快速开发之旅！
              </p>
            </div>
            <div className="lg:w-1/2 ">
              <img
                src="/banner.png"
                alt=""
                className="w-full max-w-xl mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white p-8 md:p-12 flex flex-wrap items-center justify-center gap-10 md:gap-12">
        <a
          href="https://nextjs.org/"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-primary rounded-lg px-2"
        >
          <img src="/nextjs-logo.png" alt="NextJs" className="w-10 h-10" />
          NextJs
        </a>
        <a
          href="https://tailwindcss.com/"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-primary rounded-lg px-2"
        >
          <img src="/tailwindcss.png" alt="TailWindCss" className="w-10 h-10" />
          TailWindCss
        </a>
        <a
          href="https://www.mongodb.com/zh-cn/cloud/atlas/register"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-primary rounded-lg px-2"
        >
          <img src="/mongodb.png" alt="Mongo" className="w-10 h-10" />
          Mongodb
        </a>
        <a
          href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-primary rounded-lg px-2"
        >
          <img src="/wx.png" alt="WeChat" className="w-10 h-10" />
          WeChat
        </a>
      </section>
    </div>
  );
}
