'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

export default function CaseComponent() {
  const t = useTranslations('Case');
  const messages = useMessages();
  const caseConfig = messages.Case as any;

  return (
    <section id="case" className="bg-base-100 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-base-content/70">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseConfig.items.map((item: { id: string; title: string; imageUrl: string; href: string; des: string }, index: number) => (
            <motion.a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-base-100 rounded-2xl overflow-hidden border border-base-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden bg-base-200">
                <Image
                  width={500}
                  height={300}
                  alt={item.title}
                  src={item.imageUrl}
                  quality={85}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-base-content group-hover:text-primary transition-colors">
                    {t(`items.${index}.title`)}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>
                <p className="mt-2 text-sm text-base-content/70 line-clamp-2">
                  {t(`items.${index}.des`)}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
