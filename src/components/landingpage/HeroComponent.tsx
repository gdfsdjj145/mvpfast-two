'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaBook } from 'react-icons/fa';
import { IoGiftOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { landingpageConfig } from '@/store/landingpage';

const {
  hero: heroConfig,
  brand: brandConfig,
  admin: adminConfig,
} = landingpageConfig;

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
                    {heroConfig.title}
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {heroConfig.subtitle}
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  {heroConfig.description}
                </p>
              </motion.div>

              {/* CTA 区域 */}
              <motion.div variants={itemVariants} className="space-y-6">
                <Link
                  href={heroConfig.cta.start.href}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl group mr-4"
                >
                  <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  {heroConfig.cta.start.label}
                </Link>

                <Link
                  href={heroConfig.cta.docs.href}
                  target="_blank"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-105 group"
                >
                  <FaBook className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  {heroConfig.cta.docs.label}
                </Link>
                {heroConfig.discount && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-sm">
                    <span className="text-gray-500">
                      {heroConfig.discount.description}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* 社会证明 */}
              {heroConfig.case && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4"
                >
                  <div className="flex -space-x-4">
                    {heroConfig.case.items.map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-white overflow-hidden hover:scale-110 transition-transform duration-300"
                      >
                        <Image
                          src={item.user}
                          alt={`User ${i + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-yellow-400 mb-1">
                      {'★'.repeat(5)}
                    </div>
                    <p>
                      <span className="font-bold">{heroConfig.case.num}名</span>
                      <span className="text-gray-500 ml-1">
                        {heroConfig.case.description}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 右侧图片 */}
            <motion.div variants={itemVariants} className="lg:w-1/2">
              <div className="">
                <div className="-inset-4 bg-gradient-to-r rounded-xl blur-2xl opacity-30 group-hover:opacity-40 transition duration-500" />
                <Image
                  src={heroConfig.banner.url}
                  alt={heroConfig.banner.alt}
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
          {brandConfig.items.map((tech) => (
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
      {adminConfig && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src={adminConfig.banner.url}
              alt={adminConfig.banner.alt}
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </section>
      )}
    </>
  );
}
