'use client';
import React, { useState } from 'react';
import { Check, icons } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';

export default function FeatureComponent() {
  const t = useTranslations('Feature');
  const messages = useMessages();
  const featureConfig = messages.Feature as any;
  const [selectedFeature, setSelectedFeature] = useState(0);

  const renderIcon = (icon: string) => {
    const LucideIcon = icons[icon as keyof typeof icons];
    return LucideIcon ? <LucideIcon className="w-5 h-5" /> : null;
  };

  return (
    <section id="feat" className="bg-gray-50 py-20 sm:py-24 lg:py-32">
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
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {t('description')}
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-100">
            {featureConfig.items.map((item: { name: string; icon: string }, index: number) => (
              <button
                key={item.name}
                onClick={() => setSelectedFeature(index)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  index === selectedFeature
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
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
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
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
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-purple-600" />
                        </span>
                        <span className="text-gray-600">
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
