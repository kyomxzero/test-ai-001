import { Page, expect } from '@playwright/test';
import { BASE_URLS, SELECTORS, TIMEOUTS } from '../utils/constants';
import { safeClickElement, waitForPageLoad } from '../utils/page-helpers';
import { takeTestStepScreenshot } from '../utils/screenshot-helpers';

/**
 * Page Object Model for Login functionality
 * Encapsulates login-related interactions and validations
 */
export class LoginPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto(BASE_URLS.LOGIN, { waitUntil: 'networkidle' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform complete login flow with screenshots
   * @param testCasePrefix - Test case prefix for screenshot naming
   */
  async login(testCasePrefix?: string): Promise<void> {
    const screenshotPrefix = testCasePrefix || 'login';

    // Navigate to login page
    await this.goto();
    if (testCasePrefix) {
      await takeTestStepScreenshot(this.page, testCasePrefix, '01', 'login_page');
    }

    // Click user selection
    await this.selectUser();
    if (testCasePrefix) {
      await takeTestStepScreenshot(this.page, testCasePrefix, '02', 'select_user');
    }

    // Click login button
    await this.clickLoginButton();
    if (testCasePrefix) {
      await takeTestStepScreenshot(this.page, testCasePrefix, '03', 'after_login');
    }

    // Wait for successful login
    await this.verifyLoginSuccess();
  }

  /**
   * Click user selection (user1)
   */
  async selectUser(): Promise<void> {
    try {
      await safeClickElement(
        this.page,
        [SELECTORS.LOGIN.USER_BUTTON, ...SELECTORS.LOGIN.ALTERNATIVE_USER_SELECTORS],
        undefined,
        'user selection'
      );
    } catch (error) {
      throw new Error(`Failed to select user: ${error}`);
    }
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    try {
      await safeClickElement(
        this.page,
        [SELECTORS.LOGIN.LOGIN_BUTTON, ...SELECTORS.LOGIN.ALTERNATIVE_LOGIN_SELECTORS],
        undefined,
        'login button'
      );
    } catch (error) {
      throw new Error(`Failed to click login button: ${error}`);
    }
  }

  /**
   * Verify successful login by checking URL
   */
  async verifyLoginSuccess(): Promise<void> {
    try {
      await waitForPageLoad(this.page);

      // Wait for redirect to home page
      await expect(this.page).toHaveURL(/.*\/billing\/home/, { timeout: TIMEOUTS.PAGE_LOAD });
      console.log('✓ Login successful - redirected to home page');
    } catch (error) {
      throw new Error(`Login verification failed: ${error}`);
    }
  }

  /**
   * Check if already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/billing/home') || currentUrl.includes('/billing/');
  }

  /**
   * Logout functionality (if needed)
   */
  async logout(): Promise<void> {
    // Implementation depends on the logout mechanism in the application
    // This is a placeholder for future implementation
    console.log('Logout functionality not implemented yet');
  }
}