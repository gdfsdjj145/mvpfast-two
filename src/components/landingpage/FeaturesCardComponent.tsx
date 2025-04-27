'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';

interface Feature {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
}

interface FeaturesSection {
  features: Feature[];
}

export default function FeaturesSection({ features = [] }: FeaturesSection) {
  const t = useTranslations('FeatureCard');
  const messages = useMessages();
  const featuresConfig = messages.FeatureCard as any;
  return (
    <section className="py-12 sm:py-16 lg:py-24 overflow-hidden bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {featuresConfig.items.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`grid gap-8 lg:gap-12 items-center ${
                index % 2 === 0
                  ? 'lg:grid-cols-[1fr_1.2fr]'
                  : 'lg:grid-cols-[1.2fr_1fr]'
              }`}
            >
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt || ''}
                    fill
                    className="object-cover transform hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1280px) 50vw, (min-width: 768px) 70vw, 100vw"
                  />
                </div>
              </div>

              <div
                className={`space-y-6 ${
                  index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {t(`items.${index}.title`)}
                  </h3>
                  <p className="text-lg text-base-content/70 leading-relaxed">
                    {t(`items.${index}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
