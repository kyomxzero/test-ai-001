import { Page } from '@playwright/test';
import { SELECTORS, TIMEOUTS, TEST_DATA } from '../utils/constants';
import {
  safeFillField,
  safeClickElement,
  checkForPopup,
  getFormFieldValues,
  verifyElementVisibility
} from '../utils/page-helpers';
import { takeTestStepScreenshot } from '../utils/screenshot-helpers';

export interface HolidayData {
  nameEN: string;
  nameTH: string;
  date: string;
  description: string;
}

/**
 * Page Object Model for Holiday Edit page functionality
 * Handles form interactions, validation, and edit operations
 */
export class HolidayEditPage {
  constructor(private page: Page) {}

  /**
   * Fill holiday form with provided data
   * @param holidayData - Holiday data to fill
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async fillHolidayForm(holidayData: HolidayData, testCasePrefix?: string): Promise<void> {
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for form to be ready

    console.log('📝 Filling holiday form with data:', holidayData);

    // Fill Holiday Name EN
    await safeFillField(
      this.page,
      SELECTORS.FORM_FIELDS.HOLIDAY_NAME_EN,
      holidayData.nameEN,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_08-fill_holiday_name_en.png` : undefined,
      'Holiday Name EN'
    );

    // Fill Holiday Name TH
    await safeFillField(
      this.page,
      SELECTORS.FORM_FIELDS.HOLIDAY_NAME_TH,
      holidayData.nameTH,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_09-fill_holiday_name_th.png` : undefined,
      'Holiday Name TH'
    );

    // Fill Holiday Date
    await safeFillField(
      this.page,
      SELECTORS.FORM_FIELDS.HOLIDAY_DATE,
      holidayData.date,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_10-fill_holiday_date.png` : undefined,
      'Holiday Date'
    );

    // Fill Holiday Description
    await safeFillField(
      this.page,
      SELECTORS.FORM_FIELDS.HOLIDAY_DESCRIPTION,
      holidayData.description,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_11-fill_holiday_description.png` : undefined,
      'Holiday Description'
    );

    console.log('✓ Holiday form filled successfully');
  }

  /**
   * Click Add button to add holiday to the list
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickAddButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.ADD,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_12-click_add_button.png` : undefined,
      'Add button'
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Add button clicked');
  }

  /**
   * Click Save button
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickSaveButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.SAVE,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_13-click_save_button.png` : undefined,
      'Save button'
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Save button clicked');
  }

  /**
   * Click Back button
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickBackButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.BACK,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_13-click_back_button.png` : undefined,
      'Back button'
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Back button clicked');
  }

  /**
   * Click Cancel button (usually in popups)
   * @param testCasePrefix - Test case prefix for screenshots
   * @param allowKeyboardFallback - Whether to use Escape key as fallback
   */
  async clickCancelButton(testCasePrefix?: string, allowKeyboardFallback = true): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.CANCEL,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_15-click_cancel_button.png` : undefined,
      'Cancel button',
      allowKeyboardFallback
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Cancel button clicked');
  }

  /**
   * Click Confirm button (usually in popups)
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickConfirmButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.CONFIRM,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_15-click_confirm_button.png` : undefined,
      'Confirm button'
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Confirm button clicked');
  }

  /**
   * Click Clear button
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickClearButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.CLEAR,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_12-click_clear_button.png` : undefined,
      'Clear button'
    );

    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    console.log('✓ Clear button clicked');
  }

  /**
   * Click Delete button (for deleting existing holiday entries)
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async clickDeleteButton(testCasePrefix?: string): Promise<void> {
    await safeClickElement(
      this.page,
      SELECTORS.BUTTONS.DELETE,
      testCasePrefix ? `screenshots/${testCasePrefix}/${testCasePrefix}_04-click_delete_button.png` : undefined,
      'Delete button'
    );

    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    console.log('✓ Delete button clicked');
  }

  /**
   * Select a holiday entry for deletion (by index or by holiday name)
   * @param identifier - Either index number or holiday name to select
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async selectHolidayForDeletion(identifier: number | string, testCasePrefix?: string): Promise<void> {
    let selector: string;

    if (typeof identifier === 'number') {
      // Select by index (row number)
      selector = `tbody tr:nth-child(${identifier + 1})`;
    } else {
      // Select by holiday name
      selector = `tr:has-text("${identifier}")`;
    }

    try {
      await this.page.locator(selector).click();
      console.log(`✓ Holiday selected for deletion: ${identifier}`);

      if (testCasePrefix) {
        await this.page.screenshot({
          path: `screenshots/${testCasePrefix}/${testCasePrefix}_03-holiday_selected.png`
        });
      }
    } catch (error) {
      console.log(`⚠ Could not select holiday: ${identifier}`);
    }
  }

  /**
   * Select a holiday to delete (simplified method matching desktop spec expectation)
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async selectHolidayToDelete(testCasePrefix?: string): Promise<void> {
    // Default behavior: select the first available holiday entry
    const holidaySelectors = [
      'tbody tr:first-child', // First row in table body
      'tr.holiday-row:first-child', // First holiday row
      '[data-testid="holiday-item"]:first-child', // First holiday item
      '.holiday-list-item:first-child', // First holiday list item
      'tr:has([data-holiday]):first-child' // First row with holiday data
    ];

    let selected = false;

    for (const selector of holidaySelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          await element.first().click();
          console.log(`✓ Holiday selected for deletion using selector: ${selector}`);
          selected = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!selected) {
      console.log('⚠ Could not select any holiday for deletion - no holidays found or selectors need updating');
    }

    // Take screenshot if requested
    if (testCasePrefix) {
      await this.page.screenshot({
        path: `screenshots/${testCasePrefix}/${testCasePrefix}_03-holiday_selected.png`
      });
    }
  }

  /**
   * Check for confirmation popup and handle it
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async checkForConfirmationPopup(testCasePrefix?: string): Promise<{
    found: boolean;
    content: string;
  }> {
    const popupResult = await checkForPopup(this.page, SELECTORS.POPUPS.CONFIRMATION);

    if (testCasePrefix) {
      const screenshotSuffix = popupResult.found ? '14-confirm_popup_displayed' : '14-no_popup_found';
      await takeTestStepScreenshot(this.page, testCasePrefix, '14', screenshotSuffix);
    }

    if (popupResult.found) {
      console.log('✓ Confirmation popup found');
      console.log(`Popup content: ${popupResult.content}`);
    } else {
      console.log('⚠ No confirmation popup found');
    }

    return {
      found: popupResult.found,
      content: popupResult.content
    };
  }

  /**
   * Check for warning messages
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async checkForWarningMessages(testCasePrefix?: string): Promise<{
    found: boolean;
    message: string;
  }> {
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const warningResult = await checkForPopup(this.page, SELECTORS.POPUPS.WARNING_MESSAGES);

    if (testCasePrefix) {
      const screenshotSuffix = warningResult.found ? '16-warning_message_displayed' : '16-no_warning_found';
      await takeTestStepScreenshot(this.page, testCasePrefix, '16', screenshotSuffix);
    }

    return {
      found: warningResult.found,
      message: warningResult.content
    };
  }

  /**
   * Get current form field values
   */
  async getFormValues(): Promise<Record<string, string>> {
    return await getFormFieldValues(this.page, {
      holidayNameEN: SELECTORS.FORM_FIELDS.HOLIDAY_NAME_EN,
      holidayNameTH: SELECTORS.FORM_FIELDS.HOLIDAY_NAME_TH,
      holidayDate: SELECTORS.FORM_FIELDS.HOLIDAY_DATE,
      holidayDescription: SELECTORS.FORM_FIELDS.HOLIDAY_DESCRIPTION,
    });
  }

  /**
   * Verify form is cleared (empty values)
   */
  async verifyFormCleared(): Promise<boolean> {
    const values = await this.getFormValues();
    const isEmpty = Object.values(values).every(value => !value || value.trim() === '');

    if (isEmpty) {
      console.log('✓ Form is cleared (all fields empty)');
    } else {
      console.log('⚠ Form is not cleared, some fields contain data:', values);
    }

    return isEmpty;
  }

  /**
   * Verify we're still on edit page
   */
  async verifyOnEditPage(): Promise<boolean> {
    return await verifyElementVisibility(
      this.page,
      SELECTORS.PAGE_TITLES.EDIT_HOLIDAY,
      'Edit Holiday page',
      false
    );
  }

  /**
   * Complete holiday creation workflow
   * @param holidayData - Holiday data to use
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async createHoliday(holidayData: HolidayData, testCasePrefix?: string): Promise<void> {
    await this.fillHolidayForm(holidayData, testCasePrefix);
    await this.clickAddButton(testCasePrefix);
  }

  /**
   * Complete delete workflow with confirmation (using identifier)
   * @param identifier - Holiday identifier (index or name)
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async deleteHolidayWithConfirmation(identifier: number | string, testCasePrefix?: string): Promise<void> {
    // Select holiday for deletion
    await this.selectHolidayForDeletion(identifier, testCasePrefix);

    // Click delete button
    await this.clickDeleteButton(testCasePrefix);

    // Check for delete confirmation popup
    const popup = await this.checkForConfirmationPopup(testCasePrefix);
    if (popup.found) {
      await this.clickConfirmButton(testCasePrefix);
    }
  }

  /**
   * Complete delete workflow with confirmation (simplified version)
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async deleteSelectedHolidayWithConfirmation(testCasePrefix?: string): Promise<void> {
    // Select holiday for deletion (first available)
    await this.selectHolidayToDelete(testCasePrefix);

    // Click delete button
    await this.clickDeleteButton(testCasePrefix);

    // Check for delete confirmation popup
    const popup = await this.checkForConfirmationPopup(testCasePrefix);
    if (popup.found) {
      await this.clickConfirmButton(testCasePrefix);
    }
  }

  /**
   * Complete save workflow with confirmation
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async saveWithConfirmation(testCasePrefix?: string): Promise<void> {
    await this.clickSaveButton(testCasePrefix);

    const popup = await this.checkForConfirmationPopup(testCasePrefix);
    if (popup.found) {
      await this.clickConfirmButton(testCasePrefix);
    }
  }

  /**
   * Cancel save workflow
   * @param testCasePrefix - Test case prefix for screenshots
   */
  async cancelSave(testCasePrefix?: string): Promise<void> {
    await this.clickSaveButton(testCasePrefix);

    const popup = await this.checkForConfirmationPopup(testCasePrefix);
    if (popup.found) {
      await this.clickCancelButton(testCasePrefix);
    }
  }

  /**
   * Get sample holiday data for testing
   * @param type - Type of test data to get
   */
  static getTestData(type: keyof typeof TEST_DATA.HOLIDAY_SAMPLES): HolidayData {
    return TEST_DATA.HOLIDAY_SAMPLES[type];
  }
}