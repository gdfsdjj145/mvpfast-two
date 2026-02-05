#!/usr/bin/env tsx

/**
 * SVG Logo 生成脚本
 *
 * 根据项目名称和参数生成 SVG 格式的 Logo 和 Favicon
 *
 * 使用方法:
 *   npx tsx scripts/generate-logo.ts --name "MyProject"
 *   npx tsx scripts/generate-logo.ts --name "MyProject" --style geometric --color "#6366f1"
 *   npx tsx scripts/generate-logo.ts --name "MP" --style initial --color "#f59e0b" --shape hexagon
 *
 * 参数:
 *   --name       项目名称（必填）
 *   --style      Logo 风格: initial | geometric | text（默认 initial）
 *   --color      主色调，hex 格式（默认 #6366f1）
 *   --shape      图形样式: circle | rounded-square | hexagon（默认 rounded-square，仅 initial/geometric 风格）
 *   --output     输出目录（默认 public/brand）
 *   --favicon    同时生成 favicon（默认 true）
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 参数解析
// ============================================================

interface LogoOptions {
  name: string;
  style: 'initial' | 'geometric' | 'text';
  color: string;
  shape: 'circle' | 'rounded-square' | 'hexagon';
  output: string;
  favicon: boolean;
}

function parseArgs(): LogoOptions {
  const args = process.argv.slice(2);
  const options: LogoOptions = {
    name: '',
    style: 'initial',
    color: '#6366f1',
    shape: 'rounded-square',
    output: path.resolve(process.cwd(), 'public/brand'),
    favicon: true,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        options.name = args[++i] || '';
        break;
      case '--style':
        options.style = (args[++i] as LogoOptions['style']) || 'initial';
        break;
      case '--color':
        options.color = args[++i] || '#6366f1';
        break;
      case '--shape':
        options.shape = (args[++i] as LogoOptions['shape']) || 'rounded-square';
        break;
      case '--output':
        options.output = path.resolve(process.cwd(), args[++i] || 'public/brand');
        break;
      case '--no-favicon':
        options.favicon = false;
        break;
    }
  }

  if (!options.name) {
    console.error('错误: --name 参数为必填项');
    console.log('\n使用方法:');
    console.log('  npx tsx scripts/generate-logo.ts --name "MyProject"');
    console.log('  npx tsx scripts/generate-logo.ts --name "MP" --style initial --color "#6366f1" --shape hexagon');
    console.log('\n可用风格: initial, geometric, text');
    console.log('可用形状: circle, rounded-square, hexagon');
    process.exit(1);
  }

  return options;
}

// ============================================================
// 颜色工具
// ============================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 99, g: 102, b: 241 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

// ============================================================
// 提取首字母
// ============================================================

function getInitials(name: string): string {
  // 中文：取前 1-2 个字
  if (/[\u4e00-\u9fff]/.test(name)) {
    return name.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 2);
  }
  // 英文：取大写首字母，最多 2 个
  const words = name.trim().split(/[\s\-_]+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // 单词：取前两个字母，或驼峰拆分
  const camelSplit = name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/);
  if (camelSplit.length >= 2) {
    return (camelSplit[0][0] + camelSplit[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ============================================================
// 形状生成器
// ============================================================

function shapeBackground(
  shape: LogoOptions['shape'],
  size: number,
  color: string,
  gradientId: string
): string {
  const defs = `
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lighten(color, 0.15)}" />
      <stop offset="100%" stop-color="${darken(color, 0.1)}" />
    </linearGradient>
  </defs>`;

  const half = size / 2;

  switch (shape) {
    case 'circle':
      return `${defs}
  <circle cx="${half}" cy="${half}" r="${half}" fill="url(#${gradientId})" />`;

    case 'hexagon': {
      const r = half * 0.95;
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(' ');
      return `${defs}
  <polygon points="${points}" fill="url(#${gradientId})" />`;
    }

    case 'rounded-square':
    default: {
      const radius = size * 0.2;
      return `${defs}
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#${gradientId})" />`;
    }
  }
}

// ============================================================
// Logo 风格生成器
// ============================================================

/** initial 风格: 形状背景 + 首字母 */
function generateInitialLogo(options: LogoOptions): string {
  const size = 512;
  const initials = getInitials(options.name);
  const bg = shapeBackground(options.shape, size, options.color, 'bg');

  // 根据字符数调整字号
  const fontSize = initials.length === 1 ? 240 : 200;
  const isChinese = /[\u4e00-\u9fff]/.test(initials);
  const fontFamily = isChinese
    ? "'PingFang SC', 'Microsoft YaHei', sans-serif"
    : "'Inter', 'SF Pro Display', -apple-system, sans-serif";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg}
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
    font-family="${fontFamily}" font-size="${fontSize}" font-weight="700"
    fill="white" letter-spacing="${initials.length > 1 ? '-0.02em' : '0'}">
    ${initials}
  </text>
</svg>`;
}

/** geometric 风格: 形状背景 + 几何装饰图案 + 首字母 */
function generateGeometricLogo(options: LogoOptions): string {
  const size = 512;
  const half = size / 2;
  const initials = getInitials(options.name);
  const bg = shapeBackground(options.shape, size, options.color, 'bg');

  const lightColor = lighten(options.color, 0.3);

  // 几何装饰：对角线条
  const decorations = `
  <line x1="${size * 0.15}" y1="${size * 0.85}" x2="${size * 0.85}" y2="${size * 0.15}"
    stroke="${lightColor}" stroke-width="2" opacity="0.3" />
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.06}"
    fill="none" stroke="white" stroke-width="2" opacity="0.25" />
  <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.04}"
    fill="white" opacity="0.2" />`;

  const fontSize = initials.length === 1 ? 220 : 180;
  const isChinese = /[\u4e00-\u9fff]/.test(initials);
  const fontFamily = isChinese
    ? "'PingFang SC', 'Microsoft YaHei', sans-serif"
    : "'Inter', 'SF Pro Display', -apple-system, sans-serif";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg}
  ${decorations}
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
    font-family="${fontFamily}" font-size="${fontSize}" font-weight="700"
    fill="white">
    ${initials}
  </text>
</svg>`;
}

/** text 风格: 无背景色块，纯文字 Logo（横向） */
function generateTextLogo(options: LogoOptions): string {
  const name = options.name;
  const isChinese = /[\u4e00-\u9fff]/.test(name);
  const fontSize = isChinese ? 64 : 56;
  const fontFamily = isChinese
    ? "'PingFang SC', 'Microsoft YaHei', sans-serif"
    : "'Inter', 'SF Pro Display', -apple-system, sans-serif";

  // 估算文字宽度
  const charWidth = isChinese ? fontSize : fontSize * 0.6;
  const textWidth = name.length * charWidth;
  const padding = 40;
  const width = textWidth + padding * 2 + 80; // 额外空间给图标
  const height = 100;

  const initials = getInitials(name);
  const iconSize = 60;
  const iconX = padding;
  const iconY = (height - iconSize) / 2;
  const iconRadius = iconSize * 0.18;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lighten(options.color, 0.15)}" />
      <stop offset="100%" stop-color="${darken(options.color, 0.1)}" />
    </linearGradient>
  </defs>
  <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}"
    rx="${iconRadius}" ry="${iconRadius}" fill="url(#iconGrad)" />
  <text x="${iconX + iconSize / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="central"
    font-family="${fontFamily}" font-size="28" font-weight="700" fill="white">
    ${initials.charAt(0)}
  </text>
  <text x="${iconX + iconSize + 16}" y="${height / 2}" text-anchor="start" dominant-baseline="central"
    font-family="${fontFamily}" font-size="${fontSize}" font-weight="700"
    fill="${options.color}">
    ${name}
  </text>
</svg>`;
}

// ============================================================
// Favicon 生成
// ============================================================

function generateFavicon(options: LogoOptions): string {
  const size = 64;
  const initials = getInitials(options.name);
  const letter = initials.charAt(0);
  const bg = shapeBackground('rounded-square', size, options.color, 'favBg');
  const isChinese = /[\u4e00-\u9fff]/.test(letter);
  const fontFamily = isChinese
    ? "'PingFang SC', sans-serif"
    : "'Inter', -apple-system, sans-serif";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg}
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
    font-family="${fontFamily}" font-size="36" font-weight="700" fill="white">
    ${letter}
  </text>
</svg>`;
}

// ============================================================
// 主流程
// ============================================================

function generate(options: LogoOptions): string {
  switch (options.style) {
    case 'geometric':
      return generateGeometricLogo(options);
    case 'text':
      return generateTextLogo(options);
    case 'initial':
    default:
      return generateInitialLogo(options);
  }
}

function main() {
  const options = parseArgs();

  // 确保输出目录存在
  fs.mkdirSync(options.output, { recursive: true });

  // 生成主 Logo
  const logoSvg = generate(options);
  const logoPath = path.join(options.output, 'logo.svg');
  fs.writeFileSync(logoPath, logoSvg, 'utf-8');
  console.log(`Logo 已生成: ${logoPath}`);

  // 生成 text 风格横版 Logo（如果主 Logo 不是 text 风格）
  if (options.style !== 'text') {
    const textSvg = generateTextLogo(options);
    const textPath = path.join(options.output, 'title-logo.svg');
    fs.writeFileSync(textPath, textSvg, 'utf-8');
    console.log(`横版 Logo 已生成: ${textPath}`);
  }

  // 生成 Favicon
  if (options.favicon) {
    const faviconSvg = generateFavicon(options);
    const faviconDir = path.resolve(options.output, '../favicons');
    fs.mkdirSync(faviconDir, { recursive: true });
    const faviconPath = path.join(faviconDir, 'favicon.svg');
    fs.writeFileSync(faviconPath, faviconSvg, 'utf-8');
    console.log(`Favicon 已生成: ${faviconPath}`);
  }

  console.log('\n生成参数:');
  console.log(`  名称: ${options.name}`);
  console.log(`  首字母: ${getInitials(options.name)}`);
  console.log(`  风格: ${options.style}`);
  console.log(`  颜色: ${options.color}`);
  console.log(`  形状: ${options.shape}`);
  console.log('\n完成！');
}

main();
