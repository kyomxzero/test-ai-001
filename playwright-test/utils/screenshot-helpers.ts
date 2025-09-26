import { Page } from '@playwright/test';
import { SCREENSHOT_PATHS } from './constants';

/**
 * Standardized screenshot utilities
 * Provides consistent screenshot naming and error handling
 */

/**
 * Takes a screenshot with error handling
 * @param page - Playwright page object
 * @param path - Screenshot path
 * @param fullPage - Whether to capture full page (default: false)
 */
export async function takeScreenshot(
  page: Page,
  path: string,
  fullPage = false
): Promise<void> {
  try {
    await page.screenshot({
      path,
      fullPage,
      // Ensure screenshots directory exists by using relative path
      type: 'png'
    });
    console.log(`📸 Screenshot saved: ${path}`);
  } catch (error) {
    console.log(`⚠ Failed to take screenshot ${path}: ${error}`);
  }
}

/**
 * Takes a screenshot for a specific test case step
 * @param page - Playwright page object
 * @param testCase - Test case ID (e.g., 'TC-02-048')
 * @param stepNumber - Step number (e.g., '0001_01')
 * @param description - Step description
 * @param fullPage - Whether to capture full page
 */
export async function takeTestStepScreenshot(
  page: Page,
  testCase: string,
  stepNumber: string,
  description: string,
  fullPage = false
): Promise<void> {
  const path = SCREENSHOT_PATHS.getTestPath(testCase, stepNumber, description);
  await takeScreenshot(page, path, fullPage);
}

/**
 * Takes a series of screenshots with consistent naming
 * @param page - Playwright page object
 * @param testCase - Test case ID
 * @param steps - Array of step objects with number and description
 */
export async function takeMultipleScreenshots(
  page: Page,
  testCase: string,
  steps: Array<{ number: string; description: string; fullPage?: boolean }>
): Promise<void> {
  for (const step of steps) {
    await takeTestStepScreenshot(page, testCase, step.number, step.description, step.fullPage);
    // Small delay between screenshots to ensure page stability
    await page.waitForTimeout(500);
  }
}

/**
 * Takes an error screenshot with timestamp
 * @param page - Playwright page object
 * @param testCase - Test case ID
 * @param errorDescription - Error description
 */
export async function takeErrorScreenshot(
  page: Page,
  testCase: string,
  errorDescription: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `${SCREENSHOT_PATHS.BASE}/${testCase}/${testCase}_ERROR_${errorDescription}_${timestamp}.png`;
  await takeScreenshot(page, path, true); // Full page for error screenshots
}

/**
 * Takes before/after comparison screenshots
 * @param page - Playwright page object
 * @param testCase - Test case ID
 * @param stepNumber - Step number
 * @param actionDescription - What action is being performed
 * @param takeAfter - Function to execute the action (optional)
 */
export async function takeBeforeAfterScreenshots(
  page: Page,
  testCase: string,
  stepNumber: string,
  actionDescription: string,
  takeAfter?: () => Promise<void>
): Promise<void> {
  // Before screenshot
  await takeTestStepScreenshot(page, testCase, `${stepNumber}_before`, `before_${actionDescription}`);

  // Execute action if provided
  if (takeAfter) {
    await takeAfter();
  }

  // After screenshot
  await takeTestStepScreenshot(page, testCase, `${stepNumber}_after`, `after_${actionDescription}`);
}