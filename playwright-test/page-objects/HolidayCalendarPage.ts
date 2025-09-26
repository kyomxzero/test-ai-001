import { Page, expect } from '@playwright/test';
import { BASE_URLS, SELECTORS, TIMEOUTS } from '../utils/constants';
import { safeClickElement, waitForPageLoad, verifyElementVisibility } from '../utils/page-helpers';
import { takeTestStepScreenshot } from '../utils/screenshot-helpers';

/**
 * Page Object Model for Holiday Calendar main page functionality
 * Handles navigation and main calendar operations
 */
export class HolidayCalendarPage {
  constructor(private page: Page) {}

  /**
   * Navigate to holidays calendar page
   */
  async goto(): Promise<void> {
    await this.page.goto(BASE_URLS.HOLIDAYS_CALENDAR, { waitUntil: 'networkidle' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
  }

  /**
   * Navigate to holidays calendar from home page via menu
   * @param testCasePrefix - Test case prefix for screenshot naming
   */
  async navigateFromHome(testCasePrefix?: string): Promise<void> {
    // Click Master menu
    await safeClickElement(
      this.page,
      ['text=Master'],
      undefined,
      'Master menu'
    );

    // Click Holidays Calendar Master
    await safeClickElement(
      this.page,
      ['text=Holidays Calendar Master'],
      undefined,
      'Holidays Calendar Master'
    );

    await waitForPageLoad(this.page);

    if (testCasePrefix) {
      await takeTestStepScreenshot(this.page, testCasePrefix, '05', 'holidays_calendar_page');
    }

    // Verify we're on the right page
    await this.verifyOnHolidayCalendarPage();
  }

  /**
   * Navigate to edit page for specific year
   * @param year - Year to edit
   * @param testCasePrefix - Test case prefix for screenshot naming
   */
  async navigateToEditPage(year: string, testCasePrefix?: string): Promise<void> {
    const editUrl = BASE_URLS.HOLIDAYS_CALENDAR_EDIT(year);
    await this.page.goto(editUrl, { waitUntil: 'networkidle' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TIMEOUTS.LONG); // Extra wait for dynamic content

    if (testCasePrefix) {
      await takeTestStepScreenshot(this.page, testCasePrefix, '06', `edit_page_${year}`);
    }

    // Verify we're on the edit page
    await this.verifyOnEditPage();
  }

  /**
   * Click Create button to create new holiday calendar
   */
  async clickCreateButton(): Promise<void> {
    await safeClickElement(
      this.page,
      ['button:has-text("Create")', '[data-testid="create-button"]'],
      undefined,
      'Create button'
    );

    await waitForPageLoad(this.page);
  }

  /**
   * Click Edit button for specific year
   * @param year - Year to edit
   */
  async clickEditButton(year?: string): Promise<void> {
    const editSelectors = [
      'button:has-text("Edit")',
      '[data-testid="edit-button"]',
      '.btn:has-text("Edit")'
    ];

    if (year) {
      editSelectors.unshift(`button:has-text("Edit"):near(:text("${year}"))`);
    }

    await safeClickElement(
      this.page,
      editSelectors,
      undefined,
      'Edit button'
    );

    await waitForPageLoad(this.page);
  }

  /**
   * Verify we're on the main holiday calendar page
   */
  async verifyOnHolidayCalendarPage(): Promise<void> {
    const isVisible = await verifyElementVisibility(
      this.page,
      SELECTORS.PAGE_TITLES.HOLIDAY_CALENDAR_MASTER,
      'Holiday Calendar Master title',
      true
    );

    if (!isVisible) {
      throw new Error('Not on Holiday Calendar main page');
    }

    console.log('✓ Verified on Holiday Calendar main page');
  }

  /**
   * Verify we're on the edit page
   */
  async verifyOnEditPage(): Promise<void> {
    const isVisible = await verifyElementVisibility(
      this.page,
      SELECTORS.PAGE_TITLES.EDIT_HOLIDAY,
      'Edit Holiday title',
      true
    );

    if (!isVisible) {
      throw new Error('Not on Holiday Calendar edit page');
    }

    console.log('✓ Verified on Holiday Calendar edit page');
  }

  /**
   * Get list of existing holiday years
   */
  async getExistingYears(): Promise<string[]> {
    // This would need to be implemented based on how years are displayed
    // in the actual application
    const years: string[] = [];

    try {
      // Look for year elements in the page
      const yearElements = this.page.locator('[data-year], .year-item, .holiday-year');
      const count = await yearElements.count();

      for (let i = 0; i < count; i++) {
        const yearText = await yearElements.nth(i).textContent();
        if (yearText) {
          years.push(yearText.trim());
        }
      }
    } catch (error) {
      console.log(`Could not get existing years: ${error}`);
    }

    return years;
  }

  /**
   * Check if a specific year exists in the calendar
   * @param year - Year to check
   */
  async yearExists(year: string): Promise<boolean> {
    try {
      const yearElement = this.page.locator(`text="${year}"`);
      return await yearElement.count() > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for page to be ready with loading indicators
   */
  async waitForPageReady(): Promise<void> {
    // Wait for any loading indicators to disappear
    const loadingSelectors = ['.loading', '.spinner', '[data-loading="true"]'];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout: TIMEOUTS.LONG });
      } catch (error) {
        // Selector might not exist, which is fine
        continue;
      }
    }

    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    console.log('✓ Holiday calendar page ready');
  }
}