import { describe, it, expect, vi } from 'vitest';
import { detectInputMethod, debounce, throttle } from '../../apps/ui/src/lib/utils/interactions.js';

describe('UI Interaction Utilities', () => {
  describe('detectInputMethod', () => {
    it('should detect available input methods', () => {
      const result = detectInputMethod();
      expect(result).toHaveProperty('hasTouch');
      expect(result).toHaveProperty('hasMouse');
      expect(result).toHaveProperty('hasKeyboard');
      expect(typeof result.hasTouch).toBe('boolean');
      expect(typeof result.hasMouse).toBe('boolean');
      expect(typeof result.hasKeyboard).toBe('boolean');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('test', 123);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
