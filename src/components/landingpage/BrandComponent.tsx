'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMessages, useTranslations } from 'next-intl';

export default function BrandComponent() {
  const messages = useMessages();
  const t = useTranslations('Brand');
  const brandConfig = messages.Brand as any;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-base-200/30 via-transparent to-base-200/30" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* 标题区域 */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-2">
            {t('subtitle')}
          </p>
          <h2 className="text-2xl font-bold text-base-content">
            {t('title')}
          </h2>
        </motion.div>

        {/* 技术栈网格 */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {brandConfig.items.map((tech: { name: string; href: string; logo: string }) => (
            <motion.a
              key={tech.name}
              href={tech.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl
                w-28 sm:w-32
                bg-base-100 border border-base-200/80
                hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
                transition-all duration-300 cursor-pointer"
            >
              {/* Logo 容器 */}
              <div className="relative w-12 h-12 flex items-center justify-center
                rounded-xl bg-base-200/50 group-hover:bg-primary/10
                transition-colors duration-300">
                <Image
                  src={tech.logo}
                  alt={tech.name}
                  width={32}
                  height={32}
                  quality={80}
                  loading="lazy"
                  className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* 名称 */}
              <span className="text-xs font-medium text-base-content/60 group-hover:text-base-content
                transition-colors duration-300 text-center">
                {tech.name}
              </span>

              {/* 悬浮光晕效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
