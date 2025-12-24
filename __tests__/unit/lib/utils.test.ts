import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, renderText, isWeixinBrowser, formatDate } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should join class names with space', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should filter out falsy values', () => {
      expect(cn('foo', null, undefined, '', 'bar')).toBe('foo bar');
    });

    it('should handle boolean conditions', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
    });

    it('should return empty string for no valid classes', () => {
      expect(cn(null, undefined, '')).toBe('');
    });
  });

  describe('renderText', () => {
    it('should return first character of the string', () => {
      expect(renderText('Hello')).toBe('H');
    });

    it('should return empty string for empty input', () => {
      expect(renderText('')).toBe('');
    });

    it('should handle Chinese characters', () => {
      expect(renderText('你好世界')).toBe('你');
    });

    it('should return empty string for undefined/null', () => {
      expect(renderText(undefined as unknown as string)).toBe('');
      expect(renderText(null as unknown as string)).toBe('');
    });
  });

  describe('isWeixinBrowser', () => {
    const originalUserAgent = window.navigator.userAgent;

    afterEach(() => {
      // Restore original userAgent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
        writable: true,
      });
    });

    it('should return true for WeChat browser user agent', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 MicroMessenger/8.0',
        configurable: true,
        writable: true,
      });
      expect(isWeixinBrowser()).toBe(true);
    });

    it('should return false for non-WeChat browser user agent', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/100.0',
        configurable: true,
        writable: true,
      });
      expect(isWeixinBrowser()).toBe(false);
    });

    it('should be case insensitive for micromessenger detection', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 MICROMESSENGER/8.0',
        configurable: true,
        writable: true,
      });
      expect(isWeixinBrowser()).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly in Chinese locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should handle valid date object', () => {
      const date = new Date(2024, 5, 20); // June 20, 2024
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('6');
      expect(result).toContain('20');
    });

    it('should return Invalid Date string for invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      // Note: toLocaleDateString on invalid date returns 'Invalid Date', not '无效日期'
      // The try-catch in formatDate only catches errors, not invalid date strings
      expect(result).toBe('Invalid Date');
    });
  });
});
