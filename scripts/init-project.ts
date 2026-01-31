#!/usr/bin/env tsx

/**
 * 项目初始化脚本 — 修改本地文件
 *
 * 根据项目名称、域名、主题色等参数，批量修改：
 *   - .env.development / .env.production
 *   - src/i18n/messages/zh.json / en.json
 *   - src/app/(main)/globals.css（DaisyUI 主题色）
 *   - src/constants/config.ts（APP_CONFIG.NAME）
 *
 * 使用方法:
 *   npx tsx scripts/init-project.ts --name "MyProject" --domain "myproject.com"
 *   npx tsx scripts/init-project.ts --name "我的项目" --domain "myproject.com" --color "#10b981" --locale zh
 *
 * 参数:
 *   --name     项目名称（必填）
 *   --domain   生产环境域名（默认 example.com）
 *   --color    DaisyUI 主题色 hex（默认 #6366f1）
 *   --locale   默认语言 zh|en（默认 zh）
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 参数解析
// ============================================================

interface InitOptions {
  name: string;
  domain: string;
  color: string;
  locale: string;
}

function parseArgs(): InitOptions {
  const args = process.argv.slice(2);
  const options: InitOptions = {
    name: '',
    domain: 'example.com',
    color: '#6366f1',
    locale: 'zh',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        options.name = args[++i] || '';
        break;
      case '--domain':
        options.domain = args[++i] || 'example.com';
        break;
      case '--color':
        options.color = args[++i] || '#6366f1';
        break;
      case '--locale':
        options.locale = args[++i] || 'zh';
        break;
    }
  }

  if (!options.name) {
    console.error('错误: --name 参数为必填项');
    console.log('\n使用方法:');
    console.log('  npx tsx scripts/init-project.ts --name "MyProject" --domain "myproject.com"');
    process.exit(1);
  }

  // 去掉域名前缀
  options.domain = options.domain
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  return options;
}

// ============================================================
// 根路径
// ============================================================

const ROOT = process.cwd();

function resolve(...segments: string[]): string {
  return path.resolve(ROOT, ...segments);
}

// ============================================================
// 1. 环境变量文件
// ============================================================

function writeEnvFiles(options: InitOptions) {
  const prodUrl = `https://${options.domain}`;

  // .env.development
  const devContent = `# ==============================
# 开发环境配置（自动生成）
# ==============================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
`;

  // .env.production
  const prodContent = `# ==============================
# 生产环境配置（自动生成）
# ==============================
NEXT_PUBLIC_SITE_URL=${prodUrl}
NEXT_PUBLIC_API_URL=${prodUrl}
`;

  fs.writeFileSync(resolve('.env.development'), devContent, 'utf-8');
  console.log('  .env.development');

  fs.writeFileSync(resolve('.env.production'), prodContent, 'utf-8');
  console.log('  .env.production');

  // 同步更新 .env 中的 NEXT_PUBLIC_SITE_URL（如果存在）
  const envPath = resolve('.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(
      /^NEXT_PUBLIC_SITE_URL=.*/m,
      'NEXT_PUBLIC_SITE_URL=http://localhost:3000'
    );
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('  .env (NEXT_PUBLIC_SITE_URL updated)');
  }
}

// ============================================================
// 2. i18n 文件
// ============================================================

function updateI18n(options: InitOptions) {
  const zhPath = resolve('src/i18n/messages/zh.json');
  const enPath = resolve('src/i18n/messages/en.json');

  if (fs.existsSync(zhPath)) {
    const zh = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
    applyI18nChanges(zh, options, 'zh');
    fs.writeFileSync(zhPath, JSON.stringify(zh, null, 2) + '\n', 'utf-8');
    console.log('  src/i18n/messages/zh.json');
  }

  if (fs.existsSync(enPath)) {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    applyI18nChanges(en, options, 'en');
    fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf-8');
    console.log('  src/i18n/messages/en.json');
  }
}

function applyI18nChanges(json: any, options: InitOptions, locale: 'zh' | 'en') {
  const name = options.name;
  const domain = options.domain;

  // ---- Metadata ----
  if (json.Metadata) {
    if (locale === 'zh') {
      json.Metadata.title = `${name}-快速构建网站应用`;
      json.Metadata.description = `${name} - 使用最新技术栈快速构建你的网站应用`;
      json.Metadata.keywords = `${name} 网站开发 NextJs React TailWindCss`;
    } else {
      json.Metadata.title = `${name} - Build your web application`;
      json.Metadata.description = `${name} - Build your web application with modern tech stack`;
      json.Metadata.keywords = `${name} web development NextJs React TailwindCss`;
    }
    if (json.Metadata.og) {
      json.Metadata.og.siteName = name;
    }
  }

  // ---- Pages ----
  if (json.Pages) {
    const pages = json.Pages;
    if (pages.pricing) {
      pages.pricing.description = locale === 'zh'
        ? `选择适合你的 ${name} 套餐`
        : `Choose the ${name} plan that suits you`;
      pages.pricing.keywords = locale === 'zh'
        ? `定价, 套餐, 购买, ${name}`
        : `pricing, plans, purchase, ${name}`;
    }
    if (pages.docs) {
      pages.docs.description = locale === 'zh'
        ? `${name} 使用指南和 API 文档`
        : `${name} user guide and API documentation`;
    }
    if (pages.auth) {
      pages.auth.description = locale === 'zh'
        ? `登录你的 ${name} 账户`
        : `Sign in to your ${name} account`;
    }
    if (pages.pay) {
      pages.pay.description = locale === 'zh'
        ? `完成支付购买 ${name}`
        : `Complete your ${name} purchase`;
    }
  }

  // ---- Header ----
  if (json.Header) {
    if (json.Header.logo) {
      json.Header.logo.alt = name;
    }
    // 重置导航为通用结构
    json.Header.nav = {
      items: locale === 'zh'
        ? [
            { name: '价格', href: '/#price' },
            { name: '文档', href: '/docs/introduction', target: '_blank' },
            { name: '博客', href: '/blog', target: '_blank' }
          ]
        : [
            { name: 'Pricing', href: '/#price' },
            { name: 'Docs', href: '/docs/introduction', target: '_blank' },
            { name: 'Blog', href: '/blog', target: '_blank' }
          ]
    };
  }

  // ---- Hero ----
  if (json.Hero) {
    if (locale === 'zh') {
      json.Hero.subtitle = `构建你的${name}应用`;
      json.Hero.description = `使用 ${name} 快速构建你的网站应用，包含支付、登录、文章、博客等一系列功能`;
      json.Hero.banner.alt = `${name} Preview`;
    } else {
      json.Hero.subtitle = `Build Your ${name} App`;
      json.Hero.description = `Build your web application quickly with ${name}, featuring payment, authentication, articles, blog and more`;
      json.Hero.banner.alt = `${name} Preview`;
    }
  }

  // ---- Admin ----
  if (json.Admin) {
    json.Admin.domain = domain;
  }

  // ---- Feature ----
  if (json.Feature) {
    json.Feature.title = locale === 'zh'
      ? '展示你网站的功能'
      : 'Showcase your website features';
    json.Feature.subtitle = locale === 'zh'
      ? '这一部分用于展示你的网站功能'
      : 'This section is for showcasing your website features';
    json.Feature.description = locale === 'zh'
      ? '向用户展示产品的核心功能和特色'
      : 'Showcase your product core features and highlights to users';
  }

  // ---- FeatureGrid ----
  if (json.FeatureGrid) {
    json.FeatureGrid.title = locale === 'zh'
      ? `${name}的主要特点`
      : `${name}'s main features`;
  }

  // ---- Case (清空模板展示项目) ----
  if (json.Case) {
    json.Case.title = locale === 'zh'
      ? '客户案例'
      : 'Case Studies';
    json.Case.subtitle = locale === 'zh'
      ? '查看使用我们产品的客户案例'
      : 'See how our customers use our product';
    json.Case.items = [];
  }

  // ---- Price ----
  if (json.Price) {
    json.Price.title = locale === 'zh'
      ? '选择适合你的套餐'
      : 'Choose your plan';
    json.Price.subtitle = locale === 'zh'
      ? '提供套餐的详细信息，让用户放心购买'
      : 'Detailed plan information for confident purchasing';
    json.Price.description = '';
  }

  // ---- Faq ----
  if (json.Faq) {
    json.Faq.title = locale === 'zh'
      ? `关于${name}常见问题`
      : `Common questions about ${name}`;
    json.Faq.call = {
      emailLabel: locale === 'zh' ? '邮箱' : 'Email',
      wechatLabel: locale === 'zh' ? '微信' : 'WeChat',
      email: '',
      wechat: ''
    };
    json.Faq.items = locale === 'zh'
      ? [
          { question: '如何开始使用？', answer: '注册账号后即可开始使用，我们提供完整的文档和技术支持。' },
          { question: '支持哪些支付方式？', answer: '目前支持微信支付，后续会增加更多支付方式。' },
          { question: '如何获得技术支持？', answer: '你可以通过邮件或微信联系我们的技术支持团队。' }
        ]
      : [
          { question: 'How to get started?', answer: 'Register an account to start using. We provide complete documentation and technical support.' },
          { question: 'What payment methods are supported?', answer: 'Currently WeChat Pay is supported. More payment methods will be added.' },
          { question: 'How to get technical support?', answer: 'You can contact our technical support team via email or WeChat.' }
        ];
  }

  // ---- FaqList (同步 Faq) ----
  if (json.FaqList && json.Faq) {
    json.FaqList.title = locale === 'zh' ? '常见问题' : 'FAQ';
    json.FaqList.items = json.Faq.items.map((item: any) => ({
      title: item.question,
      answer: item.answer,
    }));
  }

  // ---- Footer ----
  if (json.Footer) {
    json.Footer.title = name;
    json.Footer.subtitle = locale === 'zh'
      ? `${name} - 快速构建你的网站应用`
      : `${name} - Build your web application quickly`;
    // 清空 ICP 备案（用户自行填写）
    json.Footer.beian = { text: '', url: '' };
    // 重置链接：去掉友情链接，保留技术文档和更多
    json.Footer.items = locale === 'zh'
      ? [
          {
            title: '产品',
            links: [
              { name: '功能介绍', href: '/#features' },
              { name: '价格方案', href: '/#price' },
              { name: '常见问题', href: '/#faq' }
            ]
          },
          {
            title: '技术文档',
            links: [
              { name: 'TailwindCSS', href: 'https://tailwindcss.com/' },
              { name: 'Next.js', href: 'https://nextjs.org/' },
              { name: 'Prisma', href: 'https://www.prisma.io/' },
              { name: 'DaisyUI', href: 'https://daisyui.com/' }
            ]
          },
          {
            title: '更多',
            links: [
              { name: '商用协议', href: '/blog/commercial' }
            ]
          }
        ]
      : [
          {
            title: 'Product',
            links: [
              { name: 'Features', href: '/#features' },
              { name: 'Pricing', href: '/#price' },
              { name: 'FAQ', href: '/#faq' }
            ]
          },
          {
            title: 'Technical Docs',
            links: [
              { name: 'TailwindCSS', href: 'https://tailwindcss.com/' },
              { name: 'Next.js', href: 'https://nextjs.org/' },
              { name: 'Prisma', href: 'https://www.prisma.io/' },
              { name: 'DaisyUI', href: 'https://daisyui.com/' }
            ]
          },
          {
            title: 'More',
            links: [
              { name: 'Commercial Agreement', href: '/blog/commercial' }
            ]
          }
        ];
  }
}

// ============================================================
// 3. DaisyUI 主题色 (globals.css)
// ============================================================

function updateThemeColor(options: InitOptions) {
  const cssPath = resolve('src/app/(main)/globals.css');
  if (!fs.existsSync(cssPath)) return;

  let css = fs.readFileSync(cssPath, 'utf-8');
  css = css.replace(
    /--p:\s*#[0-9a-fA-F]{3,8}\s*;/,
    `--p: ${options.color};`
  );
  fs.writeFileSync(cssPath, css, 'utf-8');
  console.log('  src/app/(main)/globals.css (--p theme color)');
}

// ============================================================
// 4. constants/config.ts
// ============================================================

function updateAppConfig(options: InitOptions) {
  const configPath = resolve('src/constants/config.ts');
  if (!fs.existsSync(configPath)) return;

  let content = fs.readFileSync(configPath, 'utf-8');

  // 替换 NAME
  content = content.replace(
    /NAME:\s*'[^']*'/,
    `NAME: '${options.name}'`
  );

  // 替换 DESCRIPTION
  content = content.replace(
    /DESCRIPTION:\s*'[^']*'/,
    `DESCRIPTION: '${options.name} - Fast MVP Builder'`
  );

  // 替换 DEFAULT_LOCALE
  content = content.replace(
    /DEFAULT_LOCALE:\s*'[^']*'/,
    `DEFAULT_LOCALE: '${options.locale}'`
  );

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log('  src/constants/config.ts (NAME, DESCRIPTION, DEFAULT_LOCALE)');
}

// ============================================================
// 主流程
// ============================================================

function main() {
  const options = parseArgs();

  console.log(`\n初始化项目: ${options.name}`);
  console.log(`域名: ${options.domain}`);
  console.log(`主题色: ${options.color}`);
  console.log(`默认语言: ${options.locale}`);
  console.log('\n修改文件:');

  writeEnvFiles(options);
  updateI18n(options);
  updateThemeColor(options);
  updateAppConfig(options);

  console.log('\n文件修改完成！');
}

main();
