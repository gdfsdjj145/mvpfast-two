---
order: 6
key: content
title: 文档、博客
description: 文档、博客的介绍
---

### 简介

MvpFast 目前使用`next-contentlayer`作为整个模板的内容输出引擎，封装了完好的功能。

目前支持使用`markdown`文件编写你的文档

### 创建文档

MvpFast 为文档封装了`<DocumentLayout>`页面组件，会自动读取`content/docs`文件下的所有`md`文件。

如果文件是多级的情况下，可以使用`folderNames`映射文件夹名称

```js
const folderNames: { [key: string]: string } = {
  start: '开发教程',
  dev: '开始',
  // 添加更多文件夹映射...
};
```

如果想要新建文档，可以在`/content/docs`下新建`md`文件

![content](/docs/assets/content.png)

### 创建博客

博客相对文档来说封装简单点，没有层级关系，想要新建博客可以在`/content/blog`文件下新建`md`

![content1](/docs/assets/content1.png)

### ContentLayer 配置

在项目根目录配有`contentlayer.config.ts`文件，可以自行修改对应的博客、文档配置参数
