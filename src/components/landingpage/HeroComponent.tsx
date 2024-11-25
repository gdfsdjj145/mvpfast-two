'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCartShopping } from 'react-icons/fa6';
import { IoGiftOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function HeroComponent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <>
      <section className="overflow-hidden bg-white">
        {/* 背景装饰 */}
        <div className="" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32 lg:pb-20">
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 左侧内容区 */}
            <div className="flex flex-col gap-8 lg:gap-12 items-center lg:items-start text-center lg:text-left lg:w-1/2">
              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
                    在一天之内构建
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    你的网站应用
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  NextJs的开发模板，包含登录、支付、文章、博客和微信开发等模块功能，附带学习课程，让你学会快速打造网站应用，赚取第一桶金。
                </p>
              </motion.div>

              {/* CTA 区域 */}
              <motion.div variants={itemVariants} className="space-y-6">
                <Link
                  href="/pay?key=most"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                  <FaCartShopping className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  立即获取模板
                </Link>

                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm">
                  <span className="flex items-center text-green-500 font-bold text-lg">
                    <IoGiftOutline size={24} className="animate-bounce mr-1" />
                    100元
                  </span>
                  <span className="text-gray-500">
                    🛒优惠名额还剩下14个（每日更新）
                  </span>
                </div>
              </motion.div>

              {/* 社会证明 */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex -space-x-4">
                  {['/a1.jpg', '/a2.jpg', '/a3.jpg', '/a4.jpg'].map(
                    (src, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-white overflow-hidden hover:scale-110 transition-transform duration-300"
                      >
                        <Image
                          src={src}
                          alt={`User ${i + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  )}
                </div>
                <div>
                  <div className="flex gap-0.5 text-yellow-400 mb-1">
                    {'★'.repeat(5)}
                  </div>
                  <p>
                    <span className="font-bold">76名</span>
                    <span className="text-gray-500 ml-1">
                      程序员开始构建自己的产品
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* 右侧图片 */}
            <motion.div variants={itemVariants} className="lg:w-1/2">
              <div className="">
                <div className="-inset-4 bg-gradient-to-r rounded-xl blur-2xl opacity-30 group-hover:opacity-40 transition duration-500" />
                <Image
                  src="/banner.png"
                  alt="MvpFast Preview"
                  width={800}
                  height={600}
                  className="rounded-xl  hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 技术栈展示 */}
      <section className="bg-gray-50/50 border-y border-gray-100">
        <motion.div
          className="max-w-7xl mx-auto px-4 py-8 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            {
              name: 'NextJs',
              logo: '/nextjs-logo.png',
              stars: '126K⭐',
              href: 'https://nextjs.org/',
            },
            {
              name: 'TailWindCss',
              logo: '/tailwindcss.png',
              stars: '82K⭐',
              href: 'https://tailwindcss.com/',
            },
            {
              name: 'Mongodb',
              logo: '/mongodb.png',
              stars: '26K⭐',
              href: 'https://www.mongodb.com/zh-cn/cloud/atlas/register',
            },
            {
              name: 'WeChat',
              logo: '/wx.png',
              stars: '',
              href: 'https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html',
            },
          ].map((tech) => (
            <a
              key={tech.name}
              href={tech.href}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={tech.logo}
                alt={tech.name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="font-medium">{tech.name}</span>
              {tech.stars && (
                <span className="text-sm text-gray-500">{tech.stars}</span>
              )}
            </a>
          ))}
        </motion.div>
      </section>
    </>
  );
}
