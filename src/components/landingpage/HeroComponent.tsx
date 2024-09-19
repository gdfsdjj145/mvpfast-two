import React from 'react';
import Link from 'next/link';

export default function HeroComponent() {
  return (
    <>
      <section id="hero" className=" flex  justify-center bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
            <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start animate-fade-in-up lg:w-1/2">
              <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 flex flex-col gap-3 items-center lg:items-start">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient">
                  使用最短的时间
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 animate-gradient">
                  上线网站应用
                </span>
              </h1>
              <p
                className="text-lg text-gray-600 leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              >
                使用NextJS、NextAuth、TailWindCss、Mongdb
                Atlas、微信体系来构建的网站应用
              </p>
              <div
                className="space-y-4 animate-fade-in"
                style={{ animationDelay: '0.6s' }}
              >
                <Link
                  href="/pay"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  获取模板
                </Link>
                <p className="text-sm text-gray-500 flex justify-center items-center gap-2 md:text-sm">
                  🛒前100名购买用户，可享作者全程上线服务🚀
                </p>
              </div>
              <p className="text-xl font-bold text-purple-600 animate-bounce">
                立即购买，开启您的快速开发之旅！
              </p>
            </div>
            <div className="lg:w-1/2 animate-fade-in-right">
              <img
                src="/banner.png"
                alt=""
                className="w-full max-w-xl mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white p-8 md:p-12 flex flex-wrap items-center justify-center gap-4 md:gap-8">
        <a href="#">NextJs</a>
        <a href="#">TailWindCss</a>
        <a href="#">Mongo</a>
        <a href="#">WeChat</a>
      </section>
    </>
  );
}
