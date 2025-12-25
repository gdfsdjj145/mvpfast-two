'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { cn } from '@/lib/utils';

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
    <section id="price" className="bg-gray-50 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-600 tracking-wide uppercase mb-3">
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {t('subtitle')}
          </h2>
          <p className="mt-4 text-gray-600">
            {t('description')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {goods.map((good, index) => (
            <motion.div
              key={good.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative bg-white rounded-2xl p-8 sm:p-10',
                good.mostPopular
                  ? 'ring-2 ring-purple-600 shadow-xl shadow-purple-500/10'
                  : 'border border-gray-200'
              )}
            >
              {/* Popular Badge */}
              {good.mostPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    {t('more')}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-semibold text-purple-600 mb-4">
                {good.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                  ¥{good.price}
                </span>
                {good.original && (
                  <span className="text-lg text-gray-400 line-through">
                    ¥{good.original}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                {good.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {good.includedFeatures.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </span>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={`/pay?key=${good.key}`}
                className={cn(
                  'block w-full py-3 px-6 text-center text-sm font-semibold rounded-full transition-all duration-300',
                  good.mostPopular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                )}
              >
                {t('buy')}
              </a>

              {/* Tips */}
              <p className="text-center mt-4 text-xs text-gray-400">
                {t('tips')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
