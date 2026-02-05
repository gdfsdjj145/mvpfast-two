'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMessages, useTranslations } from 'next-intl';

export default function AdminComponent() {
  const messages = useMessages();
  const adminConfig = messages.Admin as any;
  const t = useTranslations('Admin');

  return (
    <section className="bg-gradient-to-b from-base-100 to-base-200 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Browser Frame */}
          <div className="bg-neutral rounded-t-xl px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-neutral-content/10 rounded-md px-3 py-1 text-xs text-neutral-content/60 max-w-md mx-auto text-center">
                {t('domain')}
              </div>
            </div>
          </div>
          {/* Screenshot */}
          <div className="bg-base-100 rounded-b-xl overflow-hidden shadow-2xl shadow-base-content/20">
            <Image
              src={adminConfig.banner.url}
              alt={adminConfig.banner.alt}
              width={1920}
              height={1080}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
