'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';

export default function BrandComponent({ brand }: { brand: any }) {
  const t = useTranslations('Brand');
  const messages = useMessages();
  const brandConfig = messages.Brand as any;
  return (
    <section className="bg-gray-50/50 border-y border-gray-100">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {brandConfig.items.map((tech: { name: string; href: string; logo: string; stars?: string }) => (
          <a
            key={tech.name}
            href={tech.href}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={tech.logo}
              alt={tech.name}
              width={32}
              height={32}
              quality={80}
              loading="lazy"
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium">{tech.name}</span>
            {tech.stars && (
              <span className="text-sm text-gray-500">{tech.stars}</span>
            )}
          </a>
        ))}
      </motion.div>
    </section>
  );
}
