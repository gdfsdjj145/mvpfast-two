'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';

export default function AdminComponent({ admin }: { admin: any }) {
  const t = useTranslations('Admin');
  const messages = useMessages();
  const adminConfig = messages.Admin as any;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative rounded-2xl overflow-hidden shadow-xl"
      >
        <Image
          src={adminConfig.banner.url}
          alt={adminConfig.banner.alt}
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
        />
      </motion.div>
    </section>
  );
}
