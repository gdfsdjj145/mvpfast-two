'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('FaqList');
  const messages = useMessages();
  const faqListConfig = messages.FaqList as unknown as any[];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            常见问题
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqListConfig.map((item: { title: string; answer: string }, index: number) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {t(`${index}.title`)}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                    {t(`${index}.answer`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
