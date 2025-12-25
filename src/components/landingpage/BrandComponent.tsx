'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMessages } from 'next-intl';

export default function BrandComponent() {
  const messages = useMessages();
  const brandConfig = messages.Brand as any;

  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {brandConfig.items.map((tech: { name: string; href: string; logo: string }, index: number) => (
            <motion.a
              key={tech.name}
              href={tech.href}
              className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-300"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Image
                src={tech.logo}
                alt={tech.name}
                width={28}
                height={28}
                quality={80}
                loading="lazy"
                className="w-7 h-7 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
              <span className="font-medium text-gray-700 text-sm">{tech.name}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
