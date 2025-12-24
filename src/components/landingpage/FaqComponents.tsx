import React from 'react';
import { useTranslations, useMessages } from 'next-intl';

export default function FaqComponents({ items }: { items: any }) {
  const t = useTranslations('Faq');
  const messages = useMessages();
  const faqConfig = messages.Faq as any;
  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              {t('title')}
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              {t('subtitle')}
              <a href="#faq" className="font-semibold text-secondary ">
                邮箱：{t('call.email')}
              </a>{' '}
              ，
              <a href="#faq" className="font-semibold text-secondary">
                微信：{t('call.wechat')}
              </a>{' '}
            </p>
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="space-y-10">
              {faqConfig.items.map((faq: { question: string; answer: string }, index: number) => (
                <div key={faq.question}>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {t(`items.${index}.question`)}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {t(`items.${index}.answer`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
