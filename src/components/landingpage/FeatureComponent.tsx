'use client';
import React, { useState } from 'react';
import {
  Check,
  CircleUser,
  BadgeJapaneseYen,
  Shield,
  Package,
  Moon,
  MessageCircleMore,
  File,
  DatabaseZap,
  CarFront,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';

// 图标映射表：只导入实际使用的图标，避免打包整个 lucide-react
const iconMap: Record<string, LucideIcon> = {
  CircleUser,
  BadgeJapaneseYen,
  Shield,
  Package,
  Moon,
  MessageCircleMore,
  File,
  DatabaseZap,
  CarFront,
};

export default function FeatureComponent() {
  const t = useTranslations('Feature');
  const messages = useMessages();
  const featureConfig = messages.Feature as any;
  const [selectedFeature, setSelectedFeature] = useState(0);

  const renderIcon = (icon: string) => {
    const IconComponent = iconMap[icon];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <section id="feat" className="bg-base-200 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
            {t('subtitle')}
          </h2>
          <p className="mt-4 text-lg text-base-content/70 leading-relaxed">
            {t('description')}
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-base-100 rounded-full p-1.5 shadow-sm border border-base-200 gap-1">
            {featureConfig.items.map((item: { name: string; icon: string }, index: number) => (
              <button
                key={item.name}
                onClick={() => setSelectedFeature(index)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                  index === selectedFeature
                    ? 'bg-primary text-primary-content shadow-md'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                )}
              >
                {renderIcon(item.icon)}
                <span className="hidden sm:inline">{t(`items.${index}.name`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFeature}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 lg:p-12"
            >
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold text-base-content mb-6">
                  {t(`items.${selectedFeature}.description`)}
                </h3>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {featureConfig.items[selectedFeature].list.map(
                    (_item: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </span>
                        <span className="text-base-content/70">
                          {t(`items.${selectedFeature}.list.${index}`)}
                        </span>
                      </motion.li>
                    )
                  )}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
