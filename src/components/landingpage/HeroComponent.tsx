import React from 'react';

export default function HeroComponent() {
  return (
    <section
      id="hero"
      className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 lg:items-start px-8 py-8 lg:py-28"
    >
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 flex flex-col gap-3 items-center lg:items-start">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            使用最短的时间
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-600 animate-pulse">
            上线网站应用
          </span>
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          使用NextJS、NextAuth、TailWindCss、Mongdb
          Atlas、微信体系来构建的网站应用
        </p>
        <div className="space-y-4">
          <a
            href="/pay"
            className="btn btn-secondary group btn-wide text-white"
          >
            获取模板
          </a>
          <p className="text-sm  flex justify-center items-center gap-2 md:text-sm">
            🛒前100名购买用户，可享作者全程上线服务🚀
          </p>
        </div>
        <p className="text-xl font-bold text-secondary animate-pulse">
          立即购买，开启您的快速开发之旅！
        </p>
      </div>
      <div className="relative max-md:-m-4 lg:w-full">
        <img src="/banner.png" alt="" className="w-full max-w-xl ml-auto" />
      </div>
    </section>
  );
}
