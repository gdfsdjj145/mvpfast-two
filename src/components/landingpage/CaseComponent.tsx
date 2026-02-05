'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

interface CaseItem {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  des: string;
}

interface CaseConfig {
  title: string;
  subtitle: string;
  items: CaseItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function CaseComponent() {
  const t = useTranslations('Case');
  const messages = useMessages();
  const caseConfig = messages.Case as CaseConfig;

  if (!caseConfig?.items?.length) {
    return null;
  }

  return (
    <section id="case" className="bg-base-100 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-base-content/70 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {caseConfig.items.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="card card-border bg-base-100 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
            >
              {/* Image */}
              <figure className="aspect-[16/10] overflow-hidden bg-base-200 relative">
                <Image
                  width={500}
                  height={312}
                  alt={item.title}
                  src={item.imageUrl}
                  quality={85}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwABmgP/Z"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </figure>

              {/* Content */}
              <div className="card-body p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="card-title text-base sm:text-lg font-semibold text-base-content group-hover:text-primary transition-colors duration-200 line-clamp-1">
                    {t(`items.${index}.title`)}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 mt-0.5" />
                </div>
                <p className="text-sm text-base-content/60 line-clamp-2 mt-1 leading-relaxed">
                  {t(`items.${index}.des`)}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
