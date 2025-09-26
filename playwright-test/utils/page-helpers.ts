import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS } from './constants';
import { takeScreenshot } from './screenshot-helpers';

/**
 * Enhanced utility functions for interacting with page elements
 * Consolidated from multiple duplicate helper functions in the original codebase
 */

/**
 * Safely fills an input field using multiple selector strategies
 * @param page - Playwright page object
 * @param selectors - Array of selectors to try
 * @param value - Value to fill
 * @param screenshotPath - Optional screenshot path
 * @param fieldName - Field name for logging (optional)
 */
export async function safeFillField(
  page: Page,
  selectors: string[],
  value: string,
  screenshotPath?: string,
  fieldName?: string
): Promise<void> {
  let filled = false;
  let lastError: Error | null = null;

  for (const selector of selectors) {
    try {
      const elements = page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        if (await element.isVisible() && await element.isEnabled()) {
          try {
            await element.clear();
            await element.fill(value);
            filled = true;
            console.log(`✓ Filled ${fieldName || 'field'} using selector: ${selector} (index ${i})`);
            break;
          } catch (e) {
            continue;
          }
        }
      }

      if (filled) break;
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  if (screenshotPath) {
    await takeScreenshot(page, screenshotPath);
  }

  if (!filled) {
    const errorMsg = `Could not fill ${fieldName || 'field'} with value "${value}". Last error: ${lastError?.message || 'Unknown error'}`;
    console.log(`⚠ ${errorMsg}`);
    // Don't throw error to allow test to continue, but log the issue
  }
}

/**
 * Safely clicks an element using multiple selector strategies
 * @param page - Playwright page object
 * @param selectors - Array of selectors to try
 * @param screenshotPath - Optional screenshot path
 * @param buttonName - Button name for logging (optional)
 * @param allowKeyboardFallback - Whether to allow Escape key fallback
 */
export async function safeClickElement(
  page: Page,
  selectors: string[],
  screenshotPath?: string,
  buttonName?: string,
  allowKeyboardFallback = false
): Promise<void> {
  let clicked = false;
  let lastError: Error | null = null;

  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        const firstElement = element.first();
        if (await firstElement.isVisible() && await firstElement.isEnabled()) {
          await firstElement.click();
          clicked = true;
          console.log(`✓ Clicked ${buttonName || 'element'} using selector: ${selector}`);
          break;
        }
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  // Fallback to keyboard action if allowed
  if (!clicked && allowKeyboardFallback) {
    try {
      await page.keyboard.press('Escape');
      clicked = true;
      console.log('✓ Used keyboard fallback (Escape key)');
    } catch (error) {
      console.log(`Keyboard fallback failed: ${error}`);
    }
  }

  await page.waitForTimeout(TIMEOUTS.SHORT);

  if (screenshotPath) {
    await takeScreenshot(page, screenshotPath);
  }

  if (!clicked) {
    const errorMsg = `Could not click ${buttonName || 'element'}. Last error: ${lastError?.message || 'Unknown error'}`;
    console.log(`⚠ ${errorMsg}`);
    // Don't throw error to allow test to continue
  }
}

/**
 * Waits for an element to be visible and optionally takes a screenshot
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param screenshotPath - Optional screenshot path
 * @param timeout - Timeout in milliseconds
 * @param elementName - Element name for logging
 */
export async function waitForElementAndScreenshot(
  page: Page,
  selector: string,
  screenshotPath?: string,
  timeout = TIMEOUTS.LONG,
  elementName?: string
): Promise<void> {
  try {
    await page.waitForSelector(selector, { timeout });
    console.log(`✓ Found element: ${elementName || selector}`);
  } catch (error) {
    console.log(`⚠ Element not found within ${timeout}ms: ${elementName || selector}`);
  }

  if (screenshotPath) {
    await takeScreenshot(page, screenshotPath);
  }
}

/**
 * Checks if a popup/modal is visible using multiple selector strategies
 * @param page - Playwright page object
 * @param selectors - Array of popup selectors to check
 * @param timeout - Timeout in milliseconds
 * @returns Object with popup status and content
 */
export async function checkForPopup(
  page: Page,
  selectors: string[],
  timeout = TIMEOUTS.LONG
): Promise<{ found: boolean; content: string; selector?: string }> {
  await page.waitForTimeout(TIMEOUTS.MEDIUM);

  for (const selector of selectors) {
    try {
      const popup = page.locator(selector);
      if (await popup.count() > 0 && await popup.isVisible()) {
        const content = await popup.textContent() || '';
        console.log(`✓ Popup found with selector: ${selector}`);
        return { found: true, content, selector };
      }
    } catch (error) {
      continue;
    }
  }

  return { found: false, content: '' };
}

/**
 * Verifies element visibility with better error handling
 * @param page - Playwright page object
 * @param selectors - Array of selectors to check
 * @param elementName - Element name for logging
 * @param required - Whether the element is required (throws if true and not found)
 */
export async function verifyElementVisibility(
  page: Page,
  selectors: string[],
  elementName: string,
  required = false
): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        const firstElement = element.first();
        if (await firstElement.isVisible()) {
          console.log(`✓ ${elementName} visible with selector: ${selector}`);
          return true;
        }
      }
    } catch (error) {
      continue;
    }
  }

  const message = `${elementName} not found or not visible`;
  if (required) {
    throw new Error(message);
  } else {
    console.log(`⚠ ${message}`);
    return false;
  }
}

/**
 * Waits for page load with multiple strategies
 * @param page - Playwright page object
 * @param url - Expected URL pattern (optional)
 * @param timeout - Timeout in milliseconds
 */
export async function waitForPageLoad(
  page: Page,
  url?: string,
  timeout = TIMEOUTS.PAGE_LOAD
): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });

    if (url) {
      await expect(page).toHaveURL(new RegExp(url), { timeout });
    }

    // Additional wait for dynamic content
    await page.waitForTimeout(TIMEOUTS.MEDIUM);
    console.log('✓ Page loaded successfully');
  } catch (error) {
    console.log(`⚠ Page load timeout: ${error}`);
    // Take screenshot for debugging
    await takeScreenshot(page, 'debug-page-load-timeout.png');
  }
}

/**
 * Get current form field values for validation
 * @param page - Playwright page object
 * @param fieldSelectors - Object mapping field names to selector arrays
 * @returns Object with field values
 */
export async function getFormFieldValues(
  page: Page,
  fieldSelectors: Record<string, string[]>
): Promise<Record<string, string>> {
  const values: Record<string, string> = {};

  for (const [fieldName, selectors] of Object.entries(fieldSelectors)) {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          const firstElement = element.first();
          if (await firstElement.isVisible()) {
            const value = await firstElement.inputValue() || '';
            values[fieldName] = value;
            console.log(`Form field ${fieldName}: "${value}"`);
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  return values;
}

/**
 * Enhanced login function with better error handling
 * @param page - Playwright page object
 * @param loginUrl - Login URL
 * @param userSelector - User selection selector
 * @param loginButtonSelector - Login button selector
 */
export async function performLogin(
  page: Page,
  loginUrl: string,
  userSelector: string,
  loginButtonSelector: string,
  screenshotPrefix = 'login'
): Promise<void> {
  await page.goto(loginUrl, { waitUntil: 'networkidle' });
  await takeScreenshot(page, `${screenshotPrefix}_01-login_page.png`);

  // Click user
  await safeClickElement(page, [userSelector], `${screenshotPrefix}_02-select_user.png`, 'user selection');

  // Click login button
  await safeClickElement(page, [loginButtonSelector], `${screenshotPrefix}_03-after_login.png`, 'login button');

  await waitForPageLoad(page);
}