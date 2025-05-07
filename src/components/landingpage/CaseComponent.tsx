'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';

export default function CaseComponent({ items }: { items: any }) {
  const t = useTranslations('Case');
  const messages = useMessages();
  const caseConfig = messages.Case as any;
  const sectionRef = useRef<HTMLElement>(null);
  const postRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    const postObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    postRefs.current.forEach((ref) => {
      if (ref) postObserver.observe(ref);
    });

    return () => {
      sectionObserver.disconnect();
      postObserver.disconnect();
    };
  }, []);

  return (
    <section
      id="case"
      ref={sectionRef}
      className="bg-white from-gray-50 to-white py-24 sm:py-32 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-pink-600">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {t('description')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {caseConfig.items.map((item, index) => (
            <article
              key={item.id}
              ref={el => {
                (postRefs.current[index] = el);
              }}
              className={`relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 opacity-0 translate-y-10 transition-all duration-700 ease-out shadow-lg hover:shadow-2xl`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <Image
                width={500}
                height={300}
                alt={item.title}
                src={item.imageUrl}
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                className={`absolute inset-0 -z-10 bg-linear-to-t ${item.gradient} opacity-70 transition-colors duration-300`}
              />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

              <h3 className="mt-3 text-xl font-semibold leading-6 text-white">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded-sm"
                >
                  <span className="absolute inset-0" />
                  {t(`items.${index}.title`)}
                  <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white"></span>
                </a>
              </h3>
              <div className="mt-3 text-sm text-white opacity-90 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                {t(`items.${index}.des`)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
