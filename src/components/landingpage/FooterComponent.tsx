const navigation = {
  main: [
    {
      name: '首页',
      href: '/',
    },
    {
      name: '功能',
      href: '#feat',
    },
    {
      name: '案例',
      href: '#case',
    },
    {
      name: '价格',
      href: '#price',
    },
    {
      name: 'FAQ',
      href: '#faq',
    },
    {
      name: '关于我们',
      href: 'https://www.islandspage.com/EM-T',
      target: '_blank',
      rel: 'external',
    },
  ],
  social: [
    {
      name: '小红书',
      href: '#https://www.xiaohongshu.com/user/profile/623e6c2500000000210241c2',
      icon: (props) => (
        <img className="w-36" src="/xiaohongshu.png" alt="" srcSet="" />
      ),
    },
    {
      name: '微信',
      href: '#',
      icon: (props) => (
        <img className="w-36" src="/wxcode.png" alt="" srcSet="" />
      ),
    },
  ],
};

export default function Example() {
  return (
    <footer id="footer">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <a
                {...item}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-10 flex justify-center space-x-10">
          {navigation.social.map((item) => (
            <a
              href={item.href}
              className="text-gray-400 hover:text-gray-500 flex justify-center items-center"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; 2024 , MvpFast
        </p>
      </div>
    </footer>
  );
}
