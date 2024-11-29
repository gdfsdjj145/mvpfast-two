---
order: 1
key: start
title: 开始
description: 开始
---

**通过简单的配置，就能将你的网站构建成功** ⚡

我们必须将一个非常漂亮的落地页展现在你的客户面前，并添加购买链接。

你跟着教程做，就可以快速的上线你的网站了。

<br />

1.如果你不知道怎么做，请查看 [快速开始](/docs/introduction)。
<br />

2.这是首页的代码，你可以复制使用。

```tsx
import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import FeatureComponent from '@/components/landingpage/FeatureComponent';
import CaseComponent from '@/components/landingpage/CaseComponent';
import PriceComponent from '@/components/landingpage/PriceComponent';
import FaqComponents from '@/components/landingpage/FaqComponents';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="font-xft">
      <Header></Header>
      <main>
        <HeroComponent></HeroComponent>
        <FeatureComponent></FeatureComponent>
        <CaseComponent></CaseComponent>
        <PriceComponent></PriceComponent>
        <FaqComponents></FaqComponents>
      </main>
      <Footer></Footer>
    </div>
  );
}
```

3.根据你的业务内容进行一些文案的修改。尽量突出重点，修改完成你就拥有一个好看的落地页了。
<br />

4.开启数据库功能，数据库功能包含用户、支付等数据的存储，如果想要整个商业链路，就需要开启[数据库](docs/start/mongodb)。
<br />

> 你已经完成了你赚钱的第一步了，加油 🚀
