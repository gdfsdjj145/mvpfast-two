'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';

export default function FeaturesSection() {
  const t = useTranslations('FeatureCard');
  const messages = useMessages();
  const featuresConfig = messages.FeatureCard as any;

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-base-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-20 lg:space-y-32">
          {featuresConfig.items.map((feature: { title: string; description: string; image: { src: string; alt: string } }, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid gap-10 lg:gap-16 items-center ${
                index % 2 === 0
                  ? 'lg:grid-cols-[1fr_1.1fr]'
                  : 'lg:grid-cols-[1.1fr_1fr]'
              }`}
            >
              {/* Image */}
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-base-200 shadow-lg shadow-base-content/10">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt || ''}
                    fill
                    quality={85}
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Content */}
              <div className={`${index % 2 === 0 ? 'lg:order-2 lg:pl-4' : 'lg:order-1 lg:pr-4'}`}>
                <span className="inline-block w-12 h-1 bg-primary rounded-full mb-6" />
                <h3 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight mb-4">
                  {t(`items.${index}.title`)}
                </h3>
                <p className="text-lg text-base-content/70 leading-relaxed">
                  {t(`items.${index}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
