'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { cn } from '@/lib/utils/common';

// 提升动画配置到模块级别，避免每次渲染重新创建
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const cardAnimation = (index: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: index * 0.1 },
});

export default function PriceComponent() {
  const t = useTranslations('Price');
  const messages = useMessages();
  const priceConfig = messages.Price as any;
  const goodsObj = priceConfig.goods;
  const goods = Object.keys(goodsObj).map((key) => ({
    ...goodsObj[key],
    key,
  }));

  return (
    <section id="price" className="bg-base-200 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          {...fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
            {t('subtitle')}
          </h2>
          <p className="mt-4 text-base-content/70">
            {t('description')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {goods.map((good, index) => (
            <motion.div
              key={good.key}
              {...cardAnimation(index)}
              className={cn(
                'relative bg-base-100 rounded-2xl p-8 sm:p-10 cursor-pointer transition-all duration-300',
                good.mostPopular
                  ? 'ring-2 ring-primary shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1'
                  : 'border border-base-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1'
              )}
            >
              {/* Popular Badge */}
              {good.mostPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-content text-xs font-semibold px-4 py-1.5 rounded-full">
                    {t('more')}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-semibold text-primary mb-4">
                {good.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl sm:text-5xl font-bold text-base-content">
                  ¥{good.price}
                </span>
                {good.original && (
                  <span className="text-lg text-base-content/40 line-through">
                    ¥{good.original}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-base-content/70 text-sm leading-relaxed mb-8">
                {good.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {good.includedFeatures.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </span>
                    <span className="text-sm text-base-content/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={`/pay?key=${good.key}`}
                className={cn(
                  'block w-full min-h-[48px] flex items-center justify-center text-center font-semibold rounded-full transition-all duration-300',
                  good.mostPopular
                    ? 'btn btn-primary text-base hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                    : 'btn btn-neutral text-base hover:shadow-md hover:-translate-y-0.5'
                )}
              >
                {t('buy')}
              </a>

              {/* Tips */}
              <p className="text-center mt-4 text-xs text-base-content/40">
                {t('tips')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
