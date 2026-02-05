'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap, Plus, Equal, Sparkles } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

// AI 工具图标配置 - 只有中国模型可点击跳转
const AI_TOOLS = [
  { name: 'Claude', logo: '/ai/claude-color.svg', href: '' },
  { name: 'ChatGPT', logo: '/ai/openai.svg', href: '' },
  { name: 'Gemini', logo: '/ai/gemini-color.svg', href: '' },
  { name: 'DeepSeek', logo: '/ai/deepseek-color.svg', href: 'https://www.deepseek.com/' },
  { name: 'Qwen', logo: '/ai/qwen-color.svg', href: 'https://tongyi.aliyun.com/' },
  { name: 'ChatGLM', logo: '/ai/chatglm-color.svg', href: 'https://chatglm.cn/' },
];

export default function AIShowcaseComponent() {
  const t = useTranslations('AIShowcase');
  const { siteConfig } = useSiteConfig();

  // 动画配置 - 遵循 150-300ms 微交互原则
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const symbolVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.3, ease: 'backOut' },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* 背景装饰 - 与相邻模块统一 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-200/40 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* 公式区域 - 响应式布局 */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">

            {/* 模板卡片 */}
            <motion.div
              variants={cardVariants}
              className="relative group"
            >
              <div className="relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 md:p-6
                border border-base-300/50 shadow-lg shadow-base-300/20
                hover:shadow-xl hover:border-primary/20 hover:bg-base-100
                transition-all duration-200 cursor-default">
                {/* 标签 */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5
                  bg-primary/10 text-primary text-xs font-medium rounded-full
                  border border-primary/20">
                  {t('labels.template') || '模板'}
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 md:w-13 md:h-13 flex items-center justify-center
                    bg-base-100 rounded-xl
                    shadow-lg shadow-base-300/25 group-hover:shadow-base-300/40
                    transition-shadow duration-200">
                    <Image
                      src="/brand/logo.png"
                      alt="MvpFast"
                      width={24}
                      height={24}
                      className="w-12 h-12 md:w-13 md:h-13 object-contain"
                    />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-base-content tracking-tight">
                    {siteConfig.siteName}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Plus 符号 */}
            <motion.div
              variants={symbolVariants}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12
                rounded-full bg-base-200/80 border border-base-300/50
                text-base-content/50"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            </motion.div>

            {/* AI 工具卡片 */}
            <motion.div
              variants={cardVariants}
              className="relative group"
            >
              <div className="relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 md:p-6
                border border-base-300/50 shadow-lg shadow-base-300/20
                hover:shadow-xl hover:border-secondary/20 hover:bg-base-100
                transition-all duration-200">
                {/* 标签 */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5
                  bg-secondary/10 text-secondary text-xs font-medium rounded-full
                  border border-secondary/20">
                  AI
                </span>

                <div className="flex items-center gap-2 md:gap-3">
                  {AI_TOOLS.map((tool, index) => {
                    const isClickable = !!tool.href;
                    const Wrapper = isClickable ? motion.a : motion.div;
                    const wrapperProps = isClickable
                      ? {
                          href: tool.href,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          'aria-label': `访问 ${tool.name}`,
                        }
                      : {};

                    return (
                      <Wrapper
                        key={tool.name}
                        {...wrapperProps}
                        variants={iconVariants}
                        custom={index}
                        whileHover={isClickable ? { scale: 1.12, y: -3 } : {}}
                        whileTap={isClickable ? { scale: 0.95 } : {}}
                        className={`group/icon relative ${isClickable ? 'cursor-pointer' : ''}`}
                        title={tool.name}
                      >
                        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden
                          bg-base-100 border border-base-300/80 shadow-md
                          transition-all duration-200
                          ${isClickable ? 'group-hover/icon:shadow-lg group-hover/icon:border-primary/30 ring-0 group-hover/icon:ring-2 group-hover/icon:ring-primary/10' : ''}`}>
                          <Image
                            src={tool.logo}
                            alt={tool.name}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* 悬浮提示 */}
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2
                          px-2 py-0.5 bg-neutral text-neutral-content text-[10px] font-medium rounded
                          opacity-0 group-hover/icon:opacity-100 scale-90 group-hover/icon:scale-100
                          transition-all duration-150 whitespace-nowrap pointer-events-none
                          shadow-lg">
                          {tool.name}
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Equals 符号 */}
            <motion.div
              variants={symbolVariants}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12
                rounded-full bg-base-200/80 border border-base-300/50
                text-base-content/50"
            >
              <Equal className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            </motion.div>

            {/* 结果卡片 */}
            <motion.div
              variants={resultVariants}
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-primary/5 via-base-100/90 to-secondary/5
                backdrop-blur-sm rounded-2xl p-5 md:p-6
                border border-primary/20 shadow-lg shadow-primary/10
                hover:shadow-xl hover:border-primary/30
                transition-all duration-200">
                {/* 闪光装饰 */}
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary/60" />

                <div className="flex items-center gap-3">
                  <div className="text-lg md:text-xl font-bold text-base-content">
                    {t('result.prefix')}
                  </div>
                  <motion.span
                    className="relative inline-flex items-center px-3 py-1
                      bg-gradient-to-r from-primary to-secondary rounded-lg
                      text-lg md:text-xl font-bold text-primary-content
                      shadow-lg shadow-primary/25"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6, ease: 'backOut' }}
                  >
                    {t('result.highlight')}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 描述文字 */}
          <motion.p
            variants={cardVariants}
            className="mt-8 md:mt-10 text-base-content/60 text-sm md:text-base text-center max-w-lg mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
