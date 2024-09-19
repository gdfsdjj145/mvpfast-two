import React from 'react';

export default function FaqComponents() {
  const faqs = [
    {
      question: 'MvpFast的支付问题',
      answer: `MvpFast模板的支付功能是完全按照国家相关规定进行的，目前使用的是微信体系的支付方式，想要对接支付模块需要开发开通微信商家验证，绑定支付密钥既可以使用支付功能`,
    },
    {
      question: '购买后得到什么',
      answer: `购买之后，你将获得该模板的所有代码：包括登录模块、支付模块、UI模块、前端代码、微信公众号代码等等。
        之后你将可以利用模板快速的实现你的想法，在遇到任何MvpFast代码的问题、流程等相关问题时，可以添加微信jiajiandu进行提问，我会在24小时内回复。
        `,
    },
    {
      question: '购买MvpFast之后，我可以做什么',
      answer: `你可以使用该模板搭建任意类型和数量的网站并且快速商业化，也可以单纯学习代码模板。但不允许私自二次售卖MvpFast模板代码，也不允许分享到相关代码平台，如发现将追究责任`,
    },
    {
      question: '如何部署MvpFast',
      answer: `部署MvpFast非常简单，只需将代码提交到个人的git仓库，之后通过Vercel一键部署，整个流程只需1分钟`,
    },
  ];
  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              关于MvpFast常见问题
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              如果你的问题这里答案，可以用一下方式联系我们
              <a href="#faq" className="font-semibold text-primary ">
                邮箱：freecloud@emong.com.cn
              </a>{' '}
              ，
              <a href="#faq" className="font-semibold text-primary">
                微信：jiajiandu
              </a>{' '}
            </p>
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="space-y-10">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {faq.answer}
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
