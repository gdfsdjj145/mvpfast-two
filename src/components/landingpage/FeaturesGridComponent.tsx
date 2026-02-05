'use client';

import { motion } from 'framer-motion';
import { icons } from 'lucide-react';
import { useTranslations, useMessages } from 'next-intl';

export default function FeaturesGrid() {
  const t = useTranslations('FeatureGrid');
  const messages = useMessages();
  const featuresConfig = messages.FeatureGrid as any;

  const renderIcon = (icon: string) => {
    const LucideIcon = icons[icon as keyof typeof icons];
    return LucideIcon ? <LucideIcon className="w-6 h-6" /> : null;
  };

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-base-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresConfig.items.map((feature: { icon: string; title: string; description: string }, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                {renderIcon(feature.icon)}
              </div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                {t(`items.${index}.title`)}
              </h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                {t(`items.${index}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
