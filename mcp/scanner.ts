// mcp/scanner.ts
/**
 * 项目扫描器 - 扫描项目技术栈并输出事实对象
 */

import fs from 'fs';
import path from 'path';

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * 技术栈类型定义
 */
export interface TechStack {
  // 基础信息
  name: string;
  version: string;
  description: string;

  // 框架
  framework: {
    name: string;
    version: string;
    router: string;
  };

  // 语言
  language: {
    name: string;
    version: string;
    strict: boolean;
  };

  // 前端
  frontend: {
    react: string;
    css: string[];
    ui: string;
    animation: string | null;
    icons: string | null;
  };

  // 后端
  backend: {
    runtime: string;
    database: string;
    orm: string;
    auth: string;
  };

  // 国际化
  i18n: {
    enabled: boolean;
    library: string | null;
    locales: string[];
    defaultLocale: string;
  };

  // 文档
  docs: {
    enabled: boolean;
    library: string | null;
  };

  // 测试
  testing: {
    enabled: boolean;
    framework: string | null;
  };

  // 部署
  deployment: {
    docker: boolean;
    platform: string[];
  };

  // 目录结构
  structure: {
    src: boolean;
    app: boolean;
    pages: boolean;
    components: boolean;
    lib: boolean;
    hooks: boolean;
    models: boolean;
    services: boolean;
    store: boolean;
    types: boolean;
    i18n: boolean;
    styles: boolean;
    prisma: boolean;
    content: boolean;
    mcp: boolean;
    tests: boolean;
  };

  // 配置文件
  configFiles: string[];

  // 扫描时间
  scannedAt: string;
}

/**
 * 安全读取 JSON 文件
 */
function readJsonFile(filePath: string): any {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}`);
  }
  return null;
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

/**
 * 检查目录是否存在
 */
function dirExists(dirPath: string): boolean {
  const fullPath = path.join(PROJECT_ROOT, dirPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

/**
 * 获取依赖版本
 */
function getDependencyVersion(
  packageJson: any,
  name: string
): string | null {
  const deps = packageJson?.dependencies || {};
  const devDeps = packageJson?.devDependencies || {};
  const version = deps[name] || devDeps[name];
  return version ? version.replace(/^\^|~/, '') : null;
}

/**
 * 检查是否使用了某个依赖
 */
function hasDependency(packageJson: any, name: string): boolean {
  const deps = packageJson?.dependencies || {};
  const devDeps = packageJson?.devDependencies || {};
  return !!(deps[name] || devDeps[name]);
}

/**
 * 扫描 i18n 配置
 */
function scanI18nConfig(): { locales: string[]; defaultLocale: string } {
  try {
    const routingPath = path.join(PROJECT_ROOT, 'src/i18n/routing.ts');
    if (fs.existsSync(routingPath)) {
      const content = fs.readFileSync(routingPath, 'utf-8');

      // 提取 locales
      const localesMatch = content.match(/locales:\s*\[([^\]]+)\]/);
      const locales = localesMatch
        ? localesMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || ['en']
        : ['en'];

      // 提取 defaultLocale
      const defaultMatch = content.match(/defaultLocale:\s*['"]([^'"]+)['"]/);
      const defaultLocale = defaultMatch ? defaultMatch[1] : 'en';

      return { locales, defaultLocale };
    }
  } catch (error) {
    console.warn('Warning: Could not scan i18n config');
  }
  return { locales: ['en'], defaultLocale: 'en' };
}

/**
 * 扫描数据库配置
 */
function scanDatabaseConfig(): string {
  try {
    const schemaPath = path.join(PROJECT_ROOT, 'prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const content = fs.readFileSync(schemaPath, 'utf-8');
      const providerMatch = content.match(/provider\s*=\s*"([^"]+)"/);
      if (providerMatch) {
        return providerMatch[1];
      }
    }
  } catch (error) {
    console.warn('Warning: Could not scan database config');
  }
  return 'unknown';
}

/**
 * 扫描 TypeScript 配置
 */
function scanTsConfig(): { strict: boolean } {
  const tsconfig = readJsonFile('tsconfig.json');
  return {
    strict: tsconfig?.compilerOptions?.strict === true,
  };
}

/**
 * 获取所有配置文件
 */
function getConfigFiles(): string[] {
  const configPatterns = [
    'package.json',
    'tsconfig.json',
    'next.config.mjs',
    'next.config.js',
    'tailwind.config.js',
    'tailwind.config.ts',
    'postcss.config.js',
    'postcss.config.mjs',
    'vitest.config.ts',
    'jest.config.js',
    'prisma/schema.prisma',
    '.env.example',
    'Dockerfile',
    'docker-compose.yml',
    'vercel.json',
    '.eslintrc.json',
    '.prettierrc',
  ];

  return configPatterns.filter(file => fileExists(file));
}

/**
 * 主扫描函数 - 扫描项目并返回技术栈对象
 */
export function scanProject(): TechStack {
  const packageJson = readJsonFile('package.json');
  const i18nConfig = scanI18nConfig();
  const tsConfig = scanTsConfig();
  const database = scanDatabaseConfig();

  const techStack: TechStack = {
    // 基础信息
    name: packageJson?.name || 'unknown',
    version: packageJson?.version || '0.0.0',
    description: packageJson?.description || '',

    // 框架
    framework: {
      name: hasDependency(packageJson, 'next') ? 'Next.js' : 'unknown',
      version: getDependencyVersion(packageJson, 'next') || 'unknown',
      router: dirExists('src/app') ? 'App Router' : dirExists('src/pages') ? 'Pages Router' : 'unknown',
    },

    // 语言
    language: {
      name: hasDependency(packageJson, 'typescript') ? 'TypeScript' : 'JavaScript',
      version: getDependencyVersion(packageJson, 'typescript') || 'N/A',
      strict: tsConfig.strict,
    },

    // 前端
    frontend: {
      react: getDependencyVersion(packageJson, 'react') || 'unknown',
      css: [
        hasDependency(packageJson, 'tailwindcss') ? `Tailwind CSS ${getDependencyVersion(packageJson, 'tailwindcss')}` : null,
        hasDependency(packageJson, 'postcss') ? 'PostCSS' : null,
      ].filter(Boolean) as string[],
      ui: hasDependency(packageJson, 'daisyui')
        ? `DaisyUI ${getDependencyVersion(packageJson, 'daisyui')}`
        : 'none',
      animation: hasDependency(packageJson, 'framer-motion')
        ? `Framer Motion ${getDependencyVersion(packageJson, 'framer-motion')}`
        : null,
      icons: hasDependency(packageJson, 'react-icons')
        ? `react-icons ${getDependencyVersion(packageJson, 'react-icons')}`
        : hasDependency(packageJson, 'lucide-react')
        ? `lucide-react ${getDependencyVersion(packageJson, 'lucide-react')}`
        : null,
    },

    // 后端
    backend: {
      runtime: 'Node.js',
      database: database,
      orm: hasDependency(packageJson, '@prisma/client')
        ? `Prisma ${getDependencyVersion(packageJson, 'prisma')}`
        : 'none',
      auth: hasDependency(packageJson, 'next-auth')
        ? `NextAuth ${getDependencyVersion(packageJson, 'next-auth')}`
        : 'none',
    },

    // 国际化
    i18n: {
      enabled: hasDependency(packageJson, 'next-intl'),
      library: hasDependency(packageJson, 'next-intl')
        ? `next-intl ${getDependencyVersion(packageJson, 'next-intl')}`
        : null,
      locales: i18nConfig.locales,
      defaultLocale: i18nConfig.defaultLocale,
    },

    // 文档
    docs: {
      enabled: hasDependency(packageJson, 'fumadocs-core'),
      library: hasDependency(packageJson, 'fumadocs-core')
        ? `Fumadocs ${getDependencyVersion(packageJson, 'fumadocs-core')}`
        : null,
    },

    // 测试
    testing: {
      enabled: hasDependency(packageJson, 'vitest') || hasDependency(packageJson, 'jest'),
      framework: hasDependency(packageJson, 'vitest')
        ? `Vitest ${getDependencyVersion(packageJson, 'vitest')}`
        : hasDependency(packageJson, 'jest')
        ? `Jest ${getDependencyVersion(packageJson, 'jest')}`
        : null,
    },

    // 部署
    deployment: {
      docker: fileExists('Dockerfile'),
      platform: [
        fileExists('vercel.json') ? 'Vercel' : null,
        fileExists('Dockerfile') ? 'Docker' : null,
      ].filter(Boolean) as string[],
    },

    // 目录结构
    structure: {
      src: dirExists('src'),
      app: dirExists('src/app'),
      pages: dirExists('src/pages'),
      components: dirExists('src/components'),
      lib: dirExists('src/lib'),
      hooks: dirExists('src/hooks'),
      models: dirExists('src/models'),
      services: dirExists('src/services'),
      store: dirExists('src/store'),
      types: dirExists('src/types'),
      i18n: dirExists('src/i18n'),
      styles: dirExists('src/styles'),
      prisma: dirExists('prisma'),
      content: dirExists('content'),
      mcp: dirExists('mcp'),
      tests: dirExists('__tests__') || dirExists('tests'),
    },

    // 配置文件
    configFiles: getConfigFiles(),

    // 扫描时间
    scannedAt: new Date().toISOString(),
  };

  return techStack;
}

/**
 * 格式化技术栈为可读文本
 */
export function formatTechStack(stack: TechStack): string {
  const lines: string[] = [
    '# 项目技术栈扫描结果',
    '',
    `**项目名称**: ${stack.name} v${stack.version}`,
    `**扫描时间**: ${new Date(stack.scannedAt).toLocaleString('zh-CN')}`,
    '',
    '## 框架',
    `- **Framework**: ${stack.framework.name} ${stack.framework.version}`,
    `- **Router**: ${stack.framework.router}`,
    '',
    '## 语言',
    `- **Language**: ${stack.language.name} ${stack.language.version}`,
    `- **Strict Mode**: ${stack.language.strict ? '是' : '否'}`,
    '',
    '## 前端',
    `- **React**: ${stack.frontend.react}`,
    `- **CSS**: ${stack.frontend.css.join(', ') || '无'}`,
    `- **UI Library**: ${stack.frontend.ui}`,
    `- **Animation**: ${stack.frontend.animation || '无'}`,
    `- **Icons**: ${stack.frontend.icons || '无'}`,
    '',
    '## 后端',
    `- **Runtime**: ${stack.backend.runtime}`,
    `- **Database**: ${stack.backend.database}`,
    `- **ORM**: ${stack.backend.orm}`,
    `- **Auth**: ${stack.backend.auth}`,
    '',
    '## 国际化',
    `- **Enabled**: ${stack.i18n.enabled ? '是' : '否'}`,
    stack.i18n.enabled ? `- **Library**: ${stack.i18n.library}` : '',
    stack.i18n.enabled ? `- **Locales**: ${stack.i18n.locales.join(', ')}` : '',
    stack.i18n.enabled ? `- **Default**: ${stack.i18n.defaultLocale}` : '',
    '',
    '## 文档系统',
    `- **Enabled**: ${stack.docs.enabled ? '是' : '否'}`,
    stack.docs.enabled ? `- **Library**: ${stack.docs.library}` : '',
    '',
    '## 测试',
    `- **Enabled**: ${stack.testing.enabled ? '是' : '否'}`,
    stack.testing.enabled ? `- **Framework**: ${stack.testing.framework}` : '',
    '',
    '## 部署',
    `- **Docker**: ${stack.deployment.docker ? '是' : '否'}`,
    `- **Platform**: ${stack.deployment.platform.join(', ') || '未配置'}`,
    '',
    '## 目录结构',
    Object.entries(stack.structure)
      .filter(([, exists]) => exists)
      .map(([dir]) => `- ✅ ${dir}/`)
      .join('\n'),
    '',
    '## 配置文件',
    stack.configFiles.map(file => `- ${file}`).join('\n'),
  ];

  return lines.filter(line => line !== '').join('\n');
}

/**
 * 获取简化的技术栈摘要（用于快速参考）
 */
export function getTechStackSummary(stack: TechStack): string {
  return [
    `${stack.framework.name} ${stack.framework.version} (${stack.framework.router})`,
    `${stack.language.name} ${stack.language.version}`,
    `React ${stack.frontend.react}`,
    stack.frontend.ui,
    stack.frontend.css.join(' + '),
    stack.backend.orm,
    stack.backend.auth,
    stack.i18n.enabled ? stack.i18n.library : null,
    stack.docs.enabled ? stack.docs.library : null,
  ]
    .filter(Boolean)
    .join(' | ');
}

// 缓存扫描结果
let cachedTechStack: TechStack | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60 * 1000; // 1分钟缓存

/**
 * 获取技术栈（带缓存）
 */
export function getTechStack(forceRefresh = false): TechStack {
  const now = Date.now();

  if (!forceRefresh && cachedTechStack && (now - cacheTime) < CACHE_TTL) {
    return cachedTechStack;
  }

  cachedTechStack = scanProject();
  cacheTime = now;

  return cachedTechStack;
}

// 启动时自动扫描一次
console.log('🔍 Scanning project tech stack...');
const initialStack = getTechStack();
console.log('✅ Tech stack scanned:', getTechStackSummary(initialStack));
