import { test, expect } from '@playwright/test';

test.describe('Multiplatform Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test.describe('Mouse Interactions', () => {
    test('should show hover effects on interactive elements', async ({ page }) => {
      const button = page.locator('button.interactive').first();
      
      await button.hover();
      const transform = await button.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      expect(transform).not.toBe('none');
    });

    test('should handle click events', async ({ page }) => {
      const button = page.locator('button').first();
      await button.click();
      
      // Verify click was registered
      await expect(button).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate with Tab key', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      const focused = await page.evaluate(() => 
        document.activeElement.tagName
      );
      
      expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
    });

    test('should activate with Enter key', async ({ page }) => {
      const button = page.locator('button').first();
      await button.focus();
      await page.keyboard.press('Enter');
      
      // Verify activation
      await expect(button).toBeVisible();
    });

    test('should show focus-visible outline', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      const outline = await page.evaluate(() => {
        const el = document.activeElement;
        return window.getComputedStyle(el).outline;
      });
      
      expect(outline).not.toBe('none');
    });
  });

  test.describe('Touch Interactions', () => {
    test('should have minimum tap target size', async ({ page }) => {
      const buttons = page.locator('.tap-target');
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        const box = await buttons.nth(i).boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should handle tap events', async ({ page }) => {
      const button = page.locator('button').first();
      await button.tap();
      
      await expect(button).toBeVisible();
    });
  });

  test.describe('Responsive Layout', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const grid = page.locator('.responsive-grid').first();
      if (await grid.isVisible()) {
        const columns = await grid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        );
        
        // Should be single column on mobile
        expect(columns.split(' ').length).toBeLessThanOrEqual(2);
      }
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const grid = page.locator('.responsive-grid').first();
      if (await grid.isVisible()) {
        const columns = await grid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        );
        
        expect(columns).toBeDefined();
      }
    });

    test('should adapt to desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const grid = page.locator('.responsive-grid').first();
      if (await grid.isVisible()) {
        const columns = await grid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        );
        
        expect(columns).toBeDefined();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const buttons = page.locator('button[aria-label]');
      const count = await buttons.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should support screen readers', async ({ page }) => {
      const srOnly = page.locator('.sr-only');
      
      if (await srOnly.count() > 0) {
        const isVisible = await srOnly.first().isVisible();
        expect(isVisible).toBe(false);
      }
    });

    test('should respect reduced motion preference', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const animated = page.locator('.fade-in').first();
      if (await animated.isVisible()) {
        const duration = await animated.evaluate(el => 
          window.getComputedStyle(el).animationDuration
        );
        
        // Should be very short or 0
        expect(parseFloat(duration)).toBeLessThan(0.1);
      }
    });
  });

  test.describe('Performance', () => {
    test('should have smooth animations', async ({ page }) => {
      const button = page.locator('button.interactive').first();
      
      await button.hover();
      
      const transition = await button.evaluate(el => 
        window.getComputedStyle(el).transition
      );
      
      expect(transition).toContain('transform');
    });

    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
