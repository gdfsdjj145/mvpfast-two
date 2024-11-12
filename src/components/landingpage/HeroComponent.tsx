import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCartShopping } from 'react-icons/fa6';
import { IoGiftOutline } from 'react-icons/io5';

export default function HeroComponent() {
  return (
    <div>
      <section id="hero" className="flex justify-center bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
            <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start lg:w-1/2">
              <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 flex flex-col gap-3 items-center lg:items-start">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  在一天之内构建
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 ">
                  你的网站应用
                </span>
              </h1>
              <p
                className="text-lg text-gray-600 leading-relaxed"
                style={{ animationDelay: '0.3s' }}
              >
                NextJs的开发模板，包含登录、支付、文章、博客和微信开发等模块功能，附带学习课程，让你学会快速打造网站应用，赚取第一桶金。
              </p>
              <div className="space-y-6 " style={{ animationDelay: '0.6s' }}>
                <Link
                  href="/#price"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
                >
                  <span className="flex gap-2 items-center">
                    <FaCartShopping className="group-hover:rotate-6 transition-all"></FaCartShopping>
                    立即获取模板
                  </span>
                </Link>
                <p className="text-sm text-gray-500 flex justify-center items-center gap-2 md:text-sm">
                  <span className="text-green-500 flex gap-1 items-center font-bold text-lg">
                    <IoGiftOutline
                      size={30}
                      className="animate-bounce"
                    ></IoGiftOutline>
                    70元
                  </span>
                  🛒优惠名额还剩下9个（每日更新）
                </p>
              </div>
              <div className="flex gap-2">
                <div className="avatar-group -space-x-6 rtl:space-x-reverse">
                  <div className="avatar">
                    <div className="w-12 hover:scale-110 transition-all duration-500">
                      <img src="/a1.jpg" alt="MvpFast" />
                    </div>
                  </div>
                  <div className="avatar">
                    <div className="w-12 hover:scale-110 transition-all duration-500">
                      <img src="/a2.jpg" alt="MvpFast" />
                    </div>
                  </div>
                  <div className="avatar">
                    <div className="w-12 hover:scale-110 transition-all duration-500">
                      <img src="/a3.jpg" alt="MvpFast" />
                    </div>
                  </div>
                  <div className="avatar">
                    <div className="w-12 hover:scale-110 transition-all duration-500">
                      <img src="/a4.jpg" alt="MvpFast" />
                    </div>
                  </div>
                </div>
                <div>
                  <p>🌟🌟🌟🌟🌟</p>
                  <p>
                    <span className="font-bold">74名</span>
                    <span className="text-gray-500">
                      程序员开始构建自己的产品
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 hover:scale-105 transition-all duration-500">
              <img
                src="/banner.png"
                alt="MvpFast"
                className="w-full max-w-xl mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white p-8 md:p-12 flex flex-wrap items-center justify-center gap-10 md:gap-12">
        <a
          href="https://nextjs.org/"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-base rounded-lg px-2 transition-all"
        >
          <Image
            src="/nextjs-logo.png"
            width={0}
            height={0}
            alt="NextJs"
            className="w-10 h-10"
          />
          NextJs <span className="px-2">126K⭐</span>
        </a>
        <a
          href="https://tailwindcss.com/"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-base rounded-lg px-2 transition-all"
        >
          <Image
            width={0}
            height={0}
            src="/tailwindcss.png"
            alt="TailWindCss"
            className="w-10 h-10"
          />
          TailWindCss <span className="px-2">82K⭐</span>
        </a>
        <a
          href="https://www.mongodb.com/zh-cn/cloud/atlas/register"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-base rounded-lg px-2 transition-all"
        >
          <Image
            width={0}
            height={0}
            src="/mongodb.png"
            alt="Mongo"
            className="w-10 h-10"
          />
          Mongodb <span className="px-2">26K⭐</span>
        </a>
        <a
          href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html"
          className="flex flex-row items-center gap-2 hover:scale-105 hover:shadow-lg hover:text-base rounded-lg px-2 transition-all"
        >
          <Image
            width={0}
            height={0}
            src="/wx.png"
            alt="WeChat"
            className="w-10 h-10"
          />
          WeChat
        </a>
      </section>
    </div>
  );
}
