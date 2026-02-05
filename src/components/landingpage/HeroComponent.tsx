'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import { motion } from 'framer-motion';

// 提升动画配置到模块级别，避免每次渲染重新创建
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

export default function HeroComponent() {
  const t = useTranslations('Hero');
  const messages = useMessages();
  const heroConfig = messages.Hero as any;

  return (
    <section className="overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-primary/5">
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
                <span className="block text-primary mb-1">
                  {t('title')}
                </span>
                <span className="block text-base-content tracking-wide">
                  {t('subtitle')}
                </span>
              </h1>
              <p className="text-base-content/70 text-base sm:text-lg leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </motion.div>

            {/* CTA 区域 */}
            <motion.div variants={itemVariants} className="flex flex-row items-center gap-4 mt-2">
              <Link
                href={heroConfig.cta.start.href}
                className="btn btn-primary rounded-full px-6 min-h-[48px] h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('cta.start.label')}
              </Link>

              <Link
                href={heroConfig.cta.docs.href}
                target="_blank"
                className="btn btn-ghost rounded-full px-6 min-h-[48px] h-12 text-base text-base-content/70 hover:text-base-content hover:bg-base-200 transition-all duration-200"
              >
                {t('cta.docs.label')}
              </Link>
            </motion.div>

            {/* 社会证明 - 多人引用样式 */}
            {heroConfig.testimonials && (
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mt-4"
              >
                {/* 头像堆叠 */}
                <div className="flex -space-x-3">
                  {(heroConfig.testimonials.avatars as string[]).map((avatar: string, index: number) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-100 shadow-sm"
                    >
                      <Image
                        src={avatar}
                        alt={`User ${index + 1}`}
                        width={40}
                        height={40}
                        quality={80}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {/* 文字描述 */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base-content/70 text-sm">
                    {t('testimonials.text')}
                  </p>
                </div>
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
