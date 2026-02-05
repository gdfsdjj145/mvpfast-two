'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

interface CaseItem {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  des: string;
  tag?: string;
}

interface CaseConfig {
  title: string;
  subtitle: string;
  items: CaseItem[];
}

export default function CaseComponent() {
  const t = useTranslations('Case');
  const messages = useMessages();
  const caseConfig = messages.Case as CaseConfig;
  const shouldReduceMotion = useReducedMotion();

  if (!caseConfig?.items?.length) {
    return null;
  }

  // Animation variants with reduced motion support
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
      scale: shouldReduceMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom easeOutQuint
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="case"
      className="relative bg-base-100 py-20 sm:py-24 lg:py-32 overflow-hidden"
      aria-labelledby="case-heading"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.header
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 lg:mb-20"
        >
          {/* Decorative element */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              {t('badge') || 'Case Studies'}
            </span>
          </motion.div>

          <h2
            id="case-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content tracking-tight leading-[1.15]"
          >
            {t('title')}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-base-content/60 leading-relaxed max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.header>

        {/* Cards Grid - Masonry-like with varied sizes on large screens */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-5 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={t('title')}
        >
          {caseConfig.items.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className={`
                group relative flex flex-col bg-base-100 rounded-2xl overflow-hidden
                border border-base-200/80 cursor-pointer
                shadow-sm hover:shadow-xl hover:shadow-base-content/5
                hover:border-primary/20
                transition-all duration-300 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                ${index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}
              `}
              role="listitem"
              aria-label={`${t(`items.${index}.title`)} - ${t(`items.${index}.des`)}`}
            >
              {/* Image Container with Overlay */}
              <figure className={`
                relative overflow-hidden bg-base-200
                ${index === 0 ? 'aspect-[21/9] lg:aspect-[2/1]' : 'aspect-[16/10]'}
              `}>
                <Image
                  width={index === 0 ? 800 : 500}
                  height={index === 0 ? 400 : 312}
                  alt=""
                  src={item.imageUrl}
                  quality={90}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  sizes={index === 0
                    ? '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  }
                />

                {/* Hover Overlay with gradient */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-base-content/60 via-base-content/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />

                {/* View Project indicator on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-medium text-base-content shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    {t('viewProject') || 'View Project'}
                  </span>
                </div>

                {/* Optional Tag Badge */}
                {item.tag && (
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-sm bg-white/90 backdrop-blur-sm border-0 text-base-content font-medium shadow-sm">
                      {item.tag}
                    </span>
                  </div>
                )}
              </figure>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-base-content group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
                    {t(`items.${index}.title`)}
                  </h3>
                  <span className="shrink-0 mt-0.5 p-1.5 rounded-full bg-base-200/50 group-hover:bg-primary/10 transition-colors duration-200">
                    <ArrowUpRight
                      className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <p className="mt-2 text-sm text-base-content/60 line-clamp-2 leading-relaxed flex-1">
                  {t(`items.${index}.des`)}
                </p>

                {/* Bottom meta (optional) */}
                <div className="mt-4 pt-4 border-t border-base-200/60 flex items-center gap-3">
                  <span className="text-xs text-base-content/40 font-medium uppercase tracking-wide">
                    {t(`items.${index}.category`) || 'Case Study'}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Optional: View All CTA */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary hover:text-primary-content bg-primary/5 hover:bg-primary border border-primary/20 hover:border-primary rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t('viewAll') || 'View All Projects'}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
