import React from 'react';

export default function HeroComponent() {
  return (
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 lg:items-start px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 flex flex-col gap-3 items-center lg:items-start">
          <span>快速构建Mvp</span>
          <span>你的网站应用</span>
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          使用NextJS、NextAuth、TailWindCss、Mongdb
          Atlas、微信体系来构建的网站应用
        </p>
        <div className="space-y-4">
          <button className="btn btn-primary group btn-wide">开始构建</button>
          <p className="text-sm  flex justify-center items-center gap-2 md:text-sm">
            前100名购买用户，可享作者全程上线服务🚀
          </p>
        </div>
      </div>
      <div className="relative max-md:-m-4 lg:w-full">
        <img src="/banner.png" alt="" className="w-full max-w-xl ml-auto" />
      </div>
    </section>
  );
}
