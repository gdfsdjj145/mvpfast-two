'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';

export default function AdminComponent() {
  const t = useTranslations('Showcase');
  const messages = useMessages();
  const showcaseConfig = messages.Showcase as any;
  const items = showcaseConfig?.items || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-200/30 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-2">
            {t('subtitle')}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-base-content">
            {t('title')}
          </h2>
        </motion.div>

        {/* 整齐的 2x2 网格布局 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {items.slice(0, 4).map((item: { title: string; description: string; image: string }, index: number) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-base-100 rounded-2xl overflow-hidden
                border border-base-200/80 hover:border-primary/20
                hover:shadow-xl transition-all duration-300"
            >
              {/* 文字区域 */}
              <div className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-base-content">
                  {item.title}
                </h3>
                <p className="text-sm text-base-content/60 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* 图片区域 */}
              <div className="px-5 md:px-6 pb-5 md:pb-6">
                <div className="relative rounded-xl overflow-hidden border border-base-200/60 shadow-md
                  group-hover:shadow-lg transition-shadow duration-300 aspect-[16/10]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    quality={85}
                    className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
