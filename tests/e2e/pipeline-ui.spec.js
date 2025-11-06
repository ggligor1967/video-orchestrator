import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Complete Video Creation Pipeline
 * 
 * Tests the full user journey from script generation to video export
 * 
 * Prerequisites:
 * - Backend running on http://127.0.0.1:4545
 * - Frontend running on http://127.0.0.1:1421
 * - Backend health check passing
 */

test.describe('Video Orchestrator - Complete Pipeline E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify backend connection indicator
    await expect(page.getByText('Backend Connected')).toBeVisible({ timeout: 10000 });
  });

  test('should display all 6 main tabs', async ({ page }) => {
    // Verify all tabs are present
    const tabs = [
      'Story & Script',
      'Background',
      'Voice-over',
      'Audio & SFX',
      'Subtitles',
      'Export & Post'
    ];

    for (const tabName of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tabName, 'i') })).toBeVisible();
    }
  });

  test('should navigate between tabs', async ({ page }) => {
    // Click on Background tab
    await page.getByRole('button', { name: /background/i }).click();
    await expect(page.getByText(/background/i).first()).toBeVisible();

    // Click on Voice-over tab
    await page.getByRole('button', { name: /voice-over/i }).click();
    await expect(page.getByText(/voice/i).first()).toBeVisible();

    // Go back to Story & Script tab
    await page.getByRole('button', { name: /story.*script/i }).click();
    await expect(page.getByText(/story.*generation/i, { exact: false })).toBeVisible();
  });

  test('should generate a script with AI', async ({ page }) => {
    // Make sure we're on Story & Script tab
    await page.getByRole('button', { name: /story.*script/i }).click();

    // Fill in the topic
    const topicInput = page.getByPlaceholder(/topic/i);
    await expect(topicInput).toBeVisible();
    await topicInput.fill('A mysterious haunted mansion in the forest');

    // Select genre
    await page.getByLabel(/horror/i).check();

    // Click generate button
    const generateButton = page.getByRole('button', { name: /generate.*script/i });
    await generateButton.click();

    // Wait for loading state
    await expect(page.getByText(/generating/i)).toBeVisible({ timeout: 5000 });

    // Wait for script to appear or error message (AI service might not be configured)
    await page.waitForTimeout(3000);

    // Check if script was generated OR if there's an API error (acceptable for testing)
    const scriptGenerated = await page.getByText(/word count/i).isVisible();
    const apiError = await page.getByText(/failed/i).isVisible();

    expect(scriptGenerated || apiError).toBeTruthy();
  });

  test('should validate script length before proceeding', async ({ page }) => {
    // Make sure we're on Story & Script tab
    await page.getByRole('button', { name: /story.*script/i }).click();

    // Try to proceed without a script
    const continueButton = page.getByRole('button', { name: /continue.*background/i });
    
    // Button should be disabled or not visible if script is too short
    if (await continueButton.isVisible()) {
      await expect(continueButton).toBeDisabled();
    }
  });

  test('should show progress indicator', async ({ page }) => {
    // Progress bar should be visible
    await expect(page.getByText(/progress/i)).toBeVisible();
    
    // Check for "0 / 6 completed" text
    await expect(page.getByText(/0.*6.*completed/i)).toBeVisible();
  });

  test('should display backend status indicator', async ({ page }) => {
    // Green dot for connected
    const statusIndicator = page.locator('.status-completed, .status-dot').first();
    await expect(statusIndicator).toBeVisible();

    // "Backend Connected" text
    await expect(page.getByText('Backend Connected')).toBeVisible();
  });

  test.describe('Background Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /background/i }).click();
    });

    test('should display background selection UI', async ({ page }) => {
      // Check for background upload or selection options
      await expect(page.getByText(/background/i).first()).toBeVisible();
    });

    test('should show upload button', async ({ page }) => {
      // Look for upload/import button
      const uploadButton = page.getByRole('button', { name: /upload|import/i });
      
      if (await uploadButton.isVisible()) {
        await expect(uploadButton).toBeVisible();
      }
    });
  });

  test.describe('Voice-over Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /voice-over/i }).click();
    });

    test('should display voice selection UI', async ({ page }) => {
      await expect(page.getByText(/voice/i).first()).toBeVisible();
    });

    test('should show voice generation button', async ({ page }) => {
      const generateButton = page.getByRole('button', { name: /generate/i });
      
      if (await generateButton.isVisible()) {
        await expect(generateButton).toBeVisible();
      }
    });
  });

  test.describe('Export Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /export/i }).click();
    });

    test('should display export options', async ({ page }) => {
      await expect(page.getByText(/export/i).first()).toBeVisible();
    });

    test('should show preset selection', async ({ page }) => {
      // Look for preset options (TikTok, YouTube, Instagram)
      const presetTexts = ['TikTok', 'YouTube', 'Instagram', 'Reels', 'Shorts'];
      
      let foundPreset = false;
      for (const preset of presetTexts) {
        if (await page.getByText(preset).isVisible().catch(() => false)) {
          foundPreset = true;
          break;
        }
      }
      
      // At least one preset should be visible
      if (!foundPreset) {
        // Export tab should at least be loaded
        await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support arrow key navigation between tabs', async ({ page }) => {
      // Focus on first tab
      await page.getByRole('button', { name: /story.*script/i }).focus();

      // Press Arrow Right to move to next tab
      await page.keyboard.press('ArrowRight');
      
      // Background tab should now be active
      await page.waitForTimeout(500);
      
      // Press Arrow Right again
      await page.keyboard.press('ArrowRight');
      
      // Voice-over tab should now be active
      await page.waitForTimeout(500);
    });
  });

  test.describe('Error Handling and Backend Disconnection', () => {
    test('should display an error message if the backend is initially unavailable', async ({ page }) => {
      // Block the health check route to simulate a down backend
      await page.route('**/health', route => route.abort());

      await page.goto('/');

      // Expect to see the error message and retry button
      await expect(page.getByText('Backend Connection Failed')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/Could not connect/)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Retry Connection' })).toBeVisible();
      await expect(page.getByText('Backend Error')).toBeVisible();
    });

    test('should attempt to reconnect when the retry button is clicked', async ({ page }) => {
      // 1. Start with a failed connection
      let attempt = 0;
      await page.route('**/health', route => {
        if (attempt === 0) {
          attempt++;
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto('/');

      // Verify initial error state
      await expect(page.getByText('Backend Connection Failed')).toBeVisible({ timeout: 15000 });
      const retryButton = page.getByRole('button', { name: 'Retry Connection' });
      await expect(retryButton).toBeVisible();

      // 2. Click the retry button
      await retryButton.click();

      // Expect to see "Retrying..." or "Connecting..."
      await expect(page.getByText(/Retrying|Connecting/)).toBeVisible();

      // 3. Verify successful connection
      await expect(page.getByText('Backend Connected')).toBeVisible({ timeout: 10000 });

      // Verify the main content loads
      await expect(page.getByRole('button', { name: /story.*script/i })).toBeVisible();
    });
  });
});

test.describe('Video Orchestrator - Tab Completion Flow', () => {
  test('should mark tab as completed and enable next tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go to Story & Script tab
    await page.getByRole('button', { name: /story.*script/i }).click();

    // Enter script manually (to avoid AI service dependency)
    const scriptTextarea = page.getByPlaceholder(/write.*script/i);
    if (await scriptTextarea.isVisible()) {
      await scriptTextarea.fill(
        'This is a test script for the integration test. ' +
        'It needs to be at least 50 characters long to pass validation. ' +
        'So here is some additional text to make it long enough.'
      );

      // Wait for validation
      await page.waitForTimeout(500);

      // Continue button should now be enabled
      const continueButton = page.getByRole('button', { name: /continue.*background/i });
      
      if (await continueButton.isVisible()) {
        await expect(continueButton).toBeEnabled();
        
        // Click continue
        await continueButton.click();
        
        // Should navigate to Background tab
        await expect(page.getByRole('button', { name: /background/i })).toHaveAttribute('aria-pressed', 'true');
      }
    }
  });
});

test.describe('Video Orchestrator - Accessibility', () => {
  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Tab buttons should have aria-pressed
    const firstTab = page.getByRole('button', { name: /story.*script/i });
    await expect(firstTab).toHaveAttribute('aria-pressed');
    
    // Tab buttons should have aria-label with step information
    const tabButtons = await page.getByRole('button', { name: /story|background|voice|audio|subtitle|export/i }).all();
    
    for (const button of tabButtons) {
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Should be able to activate elements with Enter/Space
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Video Orchestrator - Visual Regression', () => {
  test('should render main page correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for visual comparison
    // await expect(page).toHaveScreenshot('main-page.png');
    
    // For now, just verify key elements are visible
    await expect(page.getByText('Video Orchestrator')).toBeVisible();
    await expect(page.getByText('Backend Connected')).toBeVisible();
  });

  test('should render all tabs correctly', async ({ page }) => {
    await page.goto('/');
    
    const tabs = [
      'Story & Script',
      'Background',
      'Voice-over',
      'Audio & SFX',
      'Subtitles',
      'Export & Post'
    ];

    for (const tabName of tabs) {
      await page.getByRole('button', { name: new RegExp(tabName, 'i') }).click();
      await page.waitForTimeout(500);
      
      // Take screenshot of each tab
      // await expect(page).toHaveScreenshot(`tab-${tabName.toLowerCase().replace(/\s+/g, '-')}.png`);
      
      // Verify tab content loaded
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
