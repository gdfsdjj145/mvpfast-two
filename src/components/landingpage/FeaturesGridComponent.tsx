'use client';

import { motion } from 'framer-motion';
import { icons } from 'lucide-react';
import { useTranslations, useMessages } from 'next-intl';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

export default function FeaturesGrid({ features }: FeaturesGridProps) {
  const t = useTranslations('FeatureGrid');
  const messages = useMessages();
  const featuresConfig = messages.FeatureGrid as any;
  const renderIcon = (icon: string) => {
    const LucideIcon = icons[icon as keyof typeof icons];
    return <LucideIcon className="w-6 h-6" />;
  };

  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 sm:text-4xl text-secondary"
          >
            {t('title')}
          </motion.h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuresConfig.items.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-lg border bg-background p-8"
              >
                <div className="mb-4 text-4xl">{renderIcon(feature.icon)}</div>
                <h3 className="mb-2 text-xl font-bold">
                  {t(`items.${index}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`items.${index}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
