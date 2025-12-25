'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { Mail, MessageCircle } from 'lucide-react';

export default function FaqComponents() {
  const t = useTranslations('Faq');
  const messages = useMessages();
  const faqConfig = messages.Faq as any;

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32" id="faq">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 lg:gap-16">
          {/* Left Column - Header & Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 mb-12 lg:mb-0"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              {t('title')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('subtitle')}
            </p>

            {/* Contact Cards */}
            <div className="space-y-3">
              <a
                href={`mailto:${faqConfig.call.email}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">邮箱</p>
                  <p className="text-sm font-medium text-gray-900">{t('call.email')}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">微信</p>
                  <p className="text-sm font-medium text-gray-900">{t('call.wechat')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - FAQ List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <dl className="space-y-6">
              {faqConfig.items.map((faq: { question: string; answer: string }, index: number) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6"
                >
                  <dt className="text-base font-semibold text-gray-900 mb-3">
                    {t(`items.${index}.question`)}
                  </dt>
                  <dd className="text-sm text-gray-600 leading-relaxed">
                    {t(`items.${index}.answer`)}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
