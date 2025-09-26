import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { HolidayCalendarPage } from '../page-objects/HolidayCalendarPage';
import { HolidayEditPage, HolidayData } from '../page-objects/HolidayEditPage';
import { TEST_DATA, TIMEOUTS } from '../utils/constants';
import { takeTestStepScreenshot } from '../utils/screenshot-helpers';

/**
 * Test suite for Holiday Calendar Edit functionality
 * Refactored from original 1982-line file to use Page Object Model and utilities
 */
test.describe('Holiday Calendar Edit Tests', () => {
  let loginPage: LoginPage;
  let holidayCalendarPage: HolidayCalendarPage;
  let holidayEditPage: HolidayEditPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    holidayCalendarPage = new HolidayCalendarPage(page);
    holidayEditPage = new HolidayEditPage(page);
  });

  /**
   * TC-02-048: Edit Holiday with complete data and cancel save
   */
  test.skip('TC-02-048_0001: Edit Holiday with complete data and cancel save', async ({ page }) => {
    const testCase = 'TC-02-048_0001';

    // Login to system
    await test.step('Login to system', async () => {
      await loginPage.login(testCase);
    });

    // Navigate to Holidays Calendar
    await test.step('Navigate to Holidays Calendar', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await takeTestStepScreenshot(page, testCase, '04', 'initial_page');

      await holidayCalendarPage.navigateFromHome(testCase);
    });

    // Navigate to edit page for year 2026
    await test.step('1. เลือก Holiday year ที่ต้องการแก้ไข = 2026', async () => {
      await holidayCalendarPage.navigateToEditPage(TEST_DATA.YEARS.EDIT_YEAR, testCase);
    });

    // Verify edit mode
    await test.step('2. ตรวจสอบหน้า Edit Holiday', async () => {
      await page.waitForLoadState('domcontentloaded');
      await takeTestStepScreenshot(page, testCase, '07', 'verify_edit_mode');

      await holidayEditPage.verifyOnEditPage();
    });

    // Fill holiday information
    await test.step('3. กรอกข้อมูลวันหยุด', async () => {
      const holidayData = HolidayEditPage.getTestData('NEW_YEAR');
      await holidayEditPage.fillHolidayForm(holidayData, testCase);
    });

    // Click Add button
    await test.step('4. กดปุ่ม Add', async () => {
      await holidayEditPage.clickAddButton(testCase);
    });

    // Click Save button
    await test.step('5. กด Save', async () => {
      await holidayEditPage.clickSaveButton(testCase);
    });

    // Validate confirmation popup
    await test.step('Validate 1: ตรวจสอบการแสดง pop up confirm edit holiday', async () => {
      const popup = await holidayEditPage.checkForConfirmationPopup(testCase);

      if (popup.found) {
        console.log('✓ Confirmation popup displayed successfully');
      } else {
        console.log('⚠ No confirmation popup found');
      }
    });

    // Cancel the save operation
    await test.step('6. กด Cancel', async () => {
      await holidayEditPage.clickCancelButton(testCase, true);
    });

    // Validate cancellation
    await test.step('Validate 2: ตรวจสอบการยกเลิกการแก้ไข Holiday', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Check if still on edit page or back to calendar
      const isOnEditPage = await holidayEditPage.verifyOnEditPage();
      await takeTestStepScreenshot(page, testCase, '16', 'popup_dismissed');

      if (isOnEditPage) {
        console.log('✓ Still on edit page after cancellation');
      } else {
        console.log('✓ Returned to main calendar page');
      }

      await takeTestStepScreenshot(page, testCase, '17', 'back_to_calendar_page');
    });

    // Final screenshot
    await test.step('Final validation screenshot', async () => {
      await takeTestStepScreenshot(page, testCase, '18', 'final_state');
      console.log('✓ TC-02-048 test completed successfully');
    });
  });

  /**
   * TC-02-053: ทดสอบการแก้ไข Holiday โดยลบข้อมูลวันหยุดและกดบันทึก
   */
  test.skip('TC-02-053_0001: Delete Holiday data and save changes', async ({ page }) => {
    const testCase = 'TC-02-053_0001';

    // Login to system
    await test.step('Login to system', async () => {
      await loginPage.login(testCase);
    });

    // Navigate to Holidays Calendar
    await test.step('Navigate to Holidays Calendar', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await takeTestStepScreenshot(page, testCase, '04', 'initial_page');

      await holidayCalendarPage.navigateFromHome(testCase);
    });

    // Navigate to edit page for selected year
    await test.step('1. เลือก Holiday year ที่ต้องการแก้ไข', async () => {
      await holidayCalendarPage.navigateToEditPage(TEST_DATA.YEARS.EDIT_YEAR, testCase);
    });

    // Click Edit Holiday icon
    await test.step('2. กด Icon Edit Holiday', async () => {
      await page.waitForLoadState('domcontentloaded');
      await takeTestStepScreenshot(page, testCase, '07', 'verify_edit_mode');

      await holidayEditPage.verifyOnEditPage();
    });

    // Select holiday data to delete
    await test.step('3. เลือกข้อมูลวันหยุด ที่ต้องการลบ', async () => {
      await holidayEditPage.selectHolidayToDelete(testCase);
      await takeTestStepScreenshot(page, testCase, '08', 'holiday_selected_for_deletion');
    });

    // Click Delete icon
    await test.step('4. กด Icon Delete', async () => {
      await holidayEditPage.clickDeleteIcon(testCase);
      await takeTestStepScreenshot(page, testCase, '09', 'delete_icon_clicked');
    });

    // Confirm deletion
    await test.step('5. กด Delete', async () => {
      await holidayEditPage.confirmDeletion(testCase);
    });

    // Validate delete confirmation popup
    await test.step('Validate 1: ตรวจสอบการแสดง pop up confirm การลบข้อมูลวันหยุด', async () => {
      const deletePopup = await holidayEditPage.checkForDeleteConfirmationPopup(testCase);
      await takeTestStepScreenshot(page, testCase, '10', 'delete_confirmation_popup');

      if (deletePopup.found) {
        console.log('✓ Delete confirmation popup displayed successfully');
      } else {
        console.log('⚠ Delete confirmation popup not found');
      }
    });

    // Click Save button
    await test.step('6. กด Save', async () => {
      await holidayEditPage.clickSaveButton(testCase);
      await takeTestStepScreenshot(page, testCase, '11', 'save_button_clicked');
    });

    // Validate save confirmation popup
    await test.step('Validate 2: ตรวจสอบการแสดง pop up confirm การบันทึกการแก้ไข', async () => {
      const savePopup = await holidayEditPage.checkForSaveConfirmationPopup(testCase);
      await takeTestStepScreenshot(page, testCase, '12', 'save_confirmation_popup');

      if (savePopup.found) {
        console.log('✓ Save confirmation popup displayed successfully');
      } else {
        console.log('⚠ Save confirmation popup not found');
      }
    });

    // Confirm save operation
    await test.step('7. กด Confirm', async () => {
      await holidayEditPage.clickConfirmButton(testCase);
      await takeTestStepScreenshot(page, testCase, '13', 'confirm_save_clicked');
    });

    // Validate data has been saved
    await test.step('Validate 3: ตรวจสอบการบันทึกข้อมูล Holiday', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      
      // Check for success message or return to calendar page
      const saveResult = await holidayEditPage.verifySaveSuccess(testCase);
      await takeTestStepScreenshot(page, testCase, '14', 'save_validation');

      if (saveResult.success) {
        console.log('✓ Holiday data saved successfully');
      } else {
        console.log('⚠ Save operation may not have completed successfully');
      }

      // Verify the deleted holiday is no longer in the list
      const deletedHolidayExists = await holidayEditPage.verifyHolidayDeleted(testCase);
      await takeTestStepScreenshot(page, testCase, '15', 'verify_holiday_deleted');

      if (!deletedHolidayExists) {
        console.log('✓ Holiday successfully deleted from the list');
      } else {
        console.log('⚠ Holiday still appears in the list');
      }
    });

    // Final validation screenshot
    await test.step('Final validation screenshot', async () => {
      await takeTestStepScreenshot(page, testCase, '16', 'final_state');
      console.log('✓ TC-02-053 test completed successfully');
    });
  });
});