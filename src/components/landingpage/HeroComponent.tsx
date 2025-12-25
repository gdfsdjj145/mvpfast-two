'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import { motion } from 'framer-motion';

export default function HeroComponent() {
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
    <section className="overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 左侧内容区 */}
          <div className="flex flex-col gap-6 lg:gap-8 items-center lg:items-start text-center lg:text-left lg:w-[45%]">
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-tight leading-tight">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-1">
                  {t('title')}
                </span>
                <span className="block text-gray-900 tracking-wide">
                  {t('subtitle')}
                </span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </motion.div>

            {/* CTA 区域 */}
            <motion.div variants={itemVariants} className="flex flex-row items-center gap-4 mt-2">
              <Link
                href={heroConfig.cta.start.href}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                {t('cta.start.label')}
              </Link>

              <Link
                href={heroConfig.cta.docs.href}
                target="_blank"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-purple-600 border-2 border-purple-200 rounded-full transition-all duration-300 hover:border-purple-400 hover:bg-purple-50"
              >
                {t('cta.docs.label')}
              </Link>
            </motion.div>

            {/* 社会证明 - 单人引用样式 */}
            {heroConfig.testimonial && (
              <motion.div
                variants={itemVariants}
                className="flex items-start gap-3 mt-4"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-100">
                  <Image
                    src={heroConfig.testimonial.avatar}
                    alt={heroConfig.testimonial.name || 'User'}
                    width={40}
                    height={40}
                    quality={80}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-600 text-base leading-relaxed">
                  <span className="text-gray-400">"</span>
                  {t('testimonial.quote')}
                  <span className="text-gray-400">"</span>
                </p>
              </motion.div>
            )}
          </div>

          {/* 右侧图片 */}
          <motion.div variants={itemVariants} className="lg:w-[55%] w-full">
            <div className="relative">
              <Image
                src={heroConfig.banner.url}
                alt={heroConfig.banner.alt}
                width={800}
                height={600}
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, 55vw"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
