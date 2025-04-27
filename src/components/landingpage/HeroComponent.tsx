'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaBook } from 'react-icons/fa';
import { useTranslations, useMessages } from 'next-intl';
import { motion } from 'framer-motion';

export default function HeroComponent({ hero }: { hero: any }) {
  const t = useTranslations('Hero');
  const messages = useMessages();
  const heroConfig = messages.Hero as any;
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
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600 mb-3">
                  {t('title')}
                </span>
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-green-600">
                  {t('subtitle')}
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {t('description')}
              </p>
            </motion.div>

            {/* CTA 区域 */}
            <motion.div variants={itemVariants} className="space-y-6">
              <Link
                href={heroConfig.cta.start.href}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl group mr-4"
              >
                <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                {t('cta.start.label')}
              </Link>

              <Link
                href={heroConfig.cta.docs.href}
                target="_blank"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-105 group"
              >
                <FaBook className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                {t('cta.docs.label')}
              </Link>
              {heroConfig.discount && (
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm">
                  <span className="text-gray-500">
                    {t('discount.description')}
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
                      {t('case.description')}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* 右侧图片 */}
          <motion.div variants={itemVariants} className="lg:w-1/2">
            <div className="">
              <div className="-inset-4 bg-linear-to-r rounded-xl blur-2xl opacity-30 group-hover:opacity-40 transition duration-500" />
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
  );
}
