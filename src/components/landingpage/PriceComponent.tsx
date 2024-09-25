import React from 'react';
import { config } from '@/config';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CtaComponent() {
  const { goods } = config;
  return (
    <section id="price" className="bg-white pb-24 sm:pb-32">
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              购买MvpFast
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              节省你的时间，让编程小白、开发者和初创企业能快速的上线网站
            </p>
          </div>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {goods.map((good, index) => (
              <div
                key={good.key}
                className={classNames(
                  good.mostPopular ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                  index === 0 ? 'lg:rounded-r-none' : '',
                  index === goods.length - 1 ? 'lg:rounded-l-none' : '',
                  'flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={good.key}
                      className={classNames(
                        good.mostPopular ? 'text-primary' : 'text-gray-900',
                        'text-lg font-semibold leading-8'
                      )}
                    >
                      {good.name}
                    </h3>
                    {good.mostPopular ? (
                      <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                        🔥
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {good.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      ￥{good.price}
                    </span>
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                  >
                    {good.includedFeatures.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <span className="h-6 w-5 flex-none text-primary">
                          √
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={good.href}
                  aria-describedby={good.key}
                  className={classNames(
                    good.mostPopular
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/60'
                      : 'text-primary ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                    'mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  )}
                >
                  立刻购买
                </a>
                <p className="mt-6 text-center text-xs leading-5 text-gray-600">
                  提示：虚拟产品，购买后不支持退款
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
