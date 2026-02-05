import { describe, it, expect, vi } from 'vitest';
import { getGeneratorName } from '@/lib/generatorName';

describe('generatorName', () => {
  describe('getGeneratorName', () => {
    it('should return a string', () => {
      const result = getGeneratorName();
      expect(typeof result).toBe('string');
    });

    it('should contain "在" character as separator', () => {
      const result = getGeneratorName();
      expect(result).toContain('在');
    });

    it('should generate different names on multiple calls (with high probability)', () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        results.add(getGeneratorName());
      }
      // With 96*98*90 combinations, getting 10 different results is highly likely
      expect(results.size).toBeGreaterThan(1);
    });

    it('should match the expected pattern', () => {
      const result = getGeneratorName();
      // Pattern: [fruit/vegetable]在[place][activity]
      const pattern = /^.+在.+$/;
      expect(result).toMatch(pattern);
    });

    it('should generate names with consistent structure', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0) // first array - index 0
        .mockReturnValueOnce(0) // second array - index 0
        .mockReturnValueOnce(0); // third array - index 0

      const result = getGeneratorName();
      expect(result).toBe('茄子在普吉岛洗碗盘');

      vi.restoreAllMocks();
    });
  });
});
