---
order: 6
key: google
title: 谷歌统计
description: 谷歌统计
---

# 谷歌统计

在`src/app/layout.tsx`文件修改对应 id，id 的获取可以通过申请谷歌统计来获取 key

![google](/docs/assets/google.png)

```js
/src/app/layout.tsx

<Script
  strategy="lazyOnload"
  src={`https://www.googletagmanager.com/gtag/js?id=xxxxxxx`}
  />
<Script id="ga-script" strategy="lazyOnload">
{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'xxxxxxx');
`}
</Script>
```
