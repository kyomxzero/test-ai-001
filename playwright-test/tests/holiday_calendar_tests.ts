import { test, expect } from '@playwright/test';
import { Page } from 'playwright';

// Base configuration
const BASE_URL = 'http://billing-sit-web.symc.net.th';
const LOGIN_URL = `${BASE_URL}/login`;
const HOLIDAY_CALENDAR_URL = `${BASE_URL}/billing/master/holidays-calendar`;

// Helper class for Holiday Calendar operations
class HolidayCalendarHelper {
  constructor(private page: Page) {}

  async login() {
    await this.page.goto(LOGIN_URL);
    await this.page.screenshot({ path: `screenshots/login_page.png` });
    await this.page.click('text=user1');
    await this.page.screenshot({ path: `screenshots/select_user.png` });
    await this.page.click('button:has-text("เข้าสู่ระบบ")');
    await this.page.waitForLoadState('networkidle');
    await this.page.screenshot({ path: `screenshots/after_login.png` });
  }

  async navigateToHolidayCalendar() {
    await this.page.goto(HOLIDAY_CALENDAR_URL);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToEditPage(year: string) {
    await this.page.goto(`${HOLIDAY_CALENDAR_URL}/Edit/${year}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToViewPage(year: string) {
    await this.page.goto(`${HOLIDAY_CALENDAR_URL}/View/${year}`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillHolidayForm(data: {
    nameEN?: string;
    nameTH?: string;
    date?: string;
    description?: string;
  }) {
    const selectors = {
      nameEN: [
        'input[placeholder*="specify the holiday name in English"]',
        'input[placeholder*="English"]',
        'input:near(:text("Holiday Name EN"))',
        'form input[type="text"]:nth-of-type(1)'
      ],
      nameTH: [
        'input[placeholder*="specify the holiday name in Thai"]',
        'input[placeholder*="Thai"]', 
        'input:near(:text("Holiday Name TH"))',
        'form input[type="text"]:nth-of-type(2)'
      ],
      date: [
        'input[placeholder*="Please select date"]',
        'input[placeholder*="select date"]',
        'input[type="date"]',
        'input:near(:text("Holiday Date"))',
        '.ant-picker-input input'
      ],
      description: [
        'textarea[placeholder*="Enter description"]',
        'textarea[placeholder*="description"]',
        'textarea:near(:text("Holiday Description"))',
        'form textarea'
      ]
    };

    for (const [field, value] of Object.entries(data)) {
      if (value && selectors[field as keyof typeof selectors]) {
        for (const selector of selectors[field as keyof typeof selectors]) {
          try {
            const element = this.page.locator(selector);
            if (await element.count() > 0) {
              await element.fill(value);
              break;
            }
          } catch (error) {
            console.log(`Could not fill ${field}:`, error);
          }
        }
      }
    }
  }

  async clickButton(buttonText: string): Promise<boolean> {
    const buttonSelectors = [
      `button:has-text("${buttonText}")`,
      `button[data-testid="${buttonText.toLowerCase()}-button"]`,
      `.btn:has-text("${buttonText}")`,
      `input[value="${buttonText}"]`,
      `.swal2-${buttonText.toLowerCase()}`,
      `button[class*="${buttonText.toLowerCase()}"]`
    ];

    for (const selector of buttonSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          return true;
        }
      } catch (error) {
        console.log(`Could not click ${buttonText} with selector ${selector}:`, error);
      }
    }
    console.log(`Button "${buttonText}" not found`);
    return false;
  }

  async waitForConfirmationPopup(): Promise<boolean> {
    try {
      await this.page.waitForSelector('.swal2-popup, .modal, .popup, .confirm-dialog, [role="dialog"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async searchHoliday(criteria: { field: string; operator: string; value: string }) {
    const searchSelectors = [
      `select[name*="${criteria.field}"]`,
      `input[name*="${criteria.field}"]`,
      '.search-field-dropdown',
      '.ant-select'
    ];

    try {
      // Fill search criteria
      for (const selector of searchSelectors) {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          if (selector.includes('select')) {
            await element.selectOption(criteria.field);
          } else {
            await element.fill(criteria.value);
          }
          break;
        }
      }

      await this.page.waitForTimeout(1000);
      await this.clickButton('Search');
    } catch (error) {
      console.log('Error in search:', error);
    }
  }

  async takeScreenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }
}

test.describe('Holiday Calendar Master Tests - All 66 Test Cases', () => {
  let helper: HolidayCalendarHelper;

  test.beforeEach(async ({ page }) => {
    helper = new HolidayCalendarHelper(page);
    await helper.login();
  });

  // TC-02-001: ตรวจสอบการเข้าใช้งาน Holidays Calendar Master
  test('TC-02-001: Verify access to Holidays Calendar Master', async ({ page }) => {
    await test.step('Navigate to Holidays Calendar Master', async () => {
      await helper.navigateToHolidayCalendar();
      await helper.takeScreenshot('screenshots/TC-02-001/01-holiday_calendar_page.png');
    });

    await test.step('Verify page elements', async () => {
      const elements = [
        'button:has-text("Create"), .btn-create',
        'button:has-text("View Calendar"), .btn-view-calendar', 
        'button:has-text("Export"), .btn-export',
        'input[placeholder*="search"], .search-bar, input[type="search"]'
      ];
      
      for (const selector of elements) {
        await expect(page.locator(selector)).toBeVisible();
      }
      await helper.takeScreenshot('screenshots/TC-02-001/02-verify_elements.png');
    });
  });

  // TC-02-002: ทดสอบการค้นหา โดยไม่กรอก Criteria และกด Export
  test('TC-02-002: Search without criteria and export', async ({ page }) => {
    await test.step('Navigate to Holiday Calendar', async () => {
      await helper.navigateToHolidayCalendar();
      await helper.takeScreenshot('screenshots/TC-02-002/01-initial_page.png');
    });

    await test.step('Search without criteria', async () => {
      await helper.clickButton('Search');
      await page.waitForLoadState('networkidle');
      await helper.takeScreenshot('screenshots/TC-02-002/02-search_results.png');
    });

    await test.step('Export data', async () => {
      await helper.clickButton('Export');
      await page.waitForTimeout(2000);
      await helper.takeScreenshot('screenshots/TC-02-002/03-export_clicked.png');
    });
  });

  // TC-02-003: ทดสอบการค้นหา Holiday ด้วย Holiday Year "=" เท่ากับปีที่ค้นหา
  test('TC-02-003: Search Holiday by Year equals operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '=', value: '2024' });
    await helper.takeScreenshot('screenshots/TC-02-003/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-003/02-export_results.png');
  });

  // TC-02-004: ทดสอบการค้นหา Holiday ด้วย Holiday Year "<>" ไม่เท่ากับ
  test('TC-02-004: Search Holiday by Year not equals operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '<>', value: '2024' });
    await helper.takeScreenshot('screenshots/TC-02-004/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-004/02-export_results.png');
  });

  // TC-02-005: ทดสอบการค้นหา Holiday ด้วย Holiday Year ">" มากกว่า
  test('TC-02-005: Search Holiday by Year greater than operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '>', value: '2023' });
    await helper.takeScreenshot('screenshots/TC-02-005/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-005/02-export_results.png');
  });

  // TC-02-006: ทดสอบการค้นหา Holiday ด้วย Holiday Year "<" น้อยกว่า
  test('TC-02-006: Search Holiday by Year less than operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '<', value: '2025' });
    await helper.takeScreenshot('screenshots/TC-02-006/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-006/02-export_results.png');
  });

  // TC-02-007: ทดสอบการค้นหา Holiday ด้วย Holiday Year ">=" มากกว่าเท่ากับ
  test('TC-02-007: Search Holiday by Year greater equal operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '>=', value: '2024' });
    await helper.takeScreenshot('screenshots/TC-02-007/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-007/02-export_results.png');
  });

  // TC-02-008: ทดสอบการค้นหา Holiday ด้วย Holiday Year "<=" น้อยกว่าเท่ากับ
  test('TC-02-008: Search Holiday by Year less equal operator', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '<=', value: '2024' });
    await helper.takeScreenshot('screenshots/TC-02-008/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-008/02-export_results.png');
  });

  // TC-02-009: ทดสอบการค้นหา Holiday ด้วย Created by "=" 
  test('TC-02-009: Search Holiday by Created by equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created by', operator: '=', value: 'admin' });
    await helper.takeScreenshot('screenshots/TC-02-009/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-009/02-export_results.png');
  });

  // TC-02-010: ทดสอบการค้นหา Holiday ด้วย Created by "<>"
  test('TC-02-010: Search Holiday by Created by not equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created by', operator: '<>', value: 'admin' });
    await helper.takeScreenshot('screenshots/TC-02-010/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-010/02-export_results.png');
  });

  // TC-02-011: ทดสอบการค้นหา Holiday ด้วย Created by "Like"
  test('TC-02-011: Search Holiday by Created by Like', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created by', operator: 'Like', value: '%admin%' });
    await helper.takeScreenshot('screenshots/TC-02-011/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-011/02-export_results.png');
  });

  // TC-02-012: ทดสอบการค้นหา Holiday ด้วย Created by "IN"
  test('TC-02-012: Search Holiday by Created by IN', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created by', operator: 'IN', value: 'admin,user1,user2' });
    await helper.takeScreenshot('screenshots/TC-02-012/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-012/02-export_results.png');
  });

  // TC-02-013: ทดสอบการค้นหา Holiday ด้วย Created by "NOT IN"
  test('TC-02-013: Search Holiday by Created by NOT IN', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created by', operator: 'NOT IN', value: 'admin,test' });
    await helper.takeScreenshot('screenshots/TC-02-013/01-search_results.png');
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-013/02-export_results.png');
  });

  // TC-02-014-020: Created Date search tests
  test('TC-02-014: Search Holiday by Created Date equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '=', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-014/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-015: Search Holiday by Created Date not equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '<>', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-015/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-016: Search Holiday by Created Date Between', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: 'Between', value: '2024-01-01,2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-016/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-017: Search Holiday by Created Date greater than', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '>', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-017/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-018: Search Holiday by Created Date less than', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '<', value: '2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-018/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-019: Search Holiday by Created Date greater equal', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '>=', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-019/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-020: Search Holiday by Created Date less equal', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Created Date', operator: '<=', value: '2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-020/01-search_results.png');
    await helper.clickButton('Export');
  });

  // TC-02-021-025: Update by search tests
  test('TC-02-021: Search Holiday by Update by equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update by', operator: '=', value: 'admin' });
    await helper.takeScreenshot('screenshots/TC-02-021/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-022: Search Holiday by Update by not equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update by', operator: '<>', value: 'admin' });
    await helper.takeScreenshot('screenshots/TC-02-022/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-023: Search Holiday by Update by Like', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update by', operator: 'Like', value: '%admin%' });
    await helper.takeScreenshot('screenshots/TC-02-023/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-024: Search Holiday by Update by IN', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update by', operator: 'IN', value: 'admin,user1,user2' });
    await helper.takeScreenshot('screenshots/TC-02-024/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-025: Search Holiday by Update by NOT IN', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update by', operator: 'NOT IN', value: 'admin,test' });
    await helper.takeScreenshot('screenshots/TC-02-025/01-search_results.png');
    await helper.clickButton('Export');
  });

  // TC-02-026-032: Update Date search tests
  test('TC-02-026: Search Holiday by Update Date equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '=', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-026/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-027: Search Holiday by Update Date not equals', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '<>', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-027/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-028: Search Holiday by Update Date Between', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: 'Between', value: '2024-01-01,2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-028/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-029: Search Holiday by Update Date greater than', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '>', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-029/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-030: Search Holiday by Update Date less than', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '<', value: '2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-030/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-031: Search Holiday by Update Date greater equal', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '>=', value: '2024-01-01' });
    await helper.takeScreenshot('screenshots/TC-02-031/01-search_results.png');
    await helper.clickButton('Export');
  });

  test('TC-02-032: Search Holiday by Update Date less equal', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Update Date', operator: '<=', value: '2024-12-31' });
    await helper.takeScreenshot('screenshots/TC-02-032/01-search_results.png');
    await helper.clickButton('Export');
  });

  // TC-02-033: ตรวจสอบการค้นหา Holiday ด้วยการกรอกคอลัมน์มากกว่า 1 คอลัมน์
  test('TC-02-033: Search Holiday with multiple columns', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    
    // Fill multiple search criteria
    await helper.searchHoliday({ field: 'Holiday Year', operator: '=', value: '2024' });
    await helper.searchHoliday({ field: 'Created by', operator: '=', value: 'admin' });
    
    await helper.takeScreenshot('screenshots/TC-02-033/01-multiple_search.png');
    await helper.clickButton('Export');
  });

  // TC-02-034: ทดสอบการค้นหา Holiday กรณีกรอกคอลัมน์ที่ไม่มีในระบบ
  test('TC-02-034: Search Holiday with non-existent data', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '=', value: '9999' });
    await helper.takeScreenshot('screenshots/TC-02-034/01-no_data_search.png');
    await helper.clickButton('Export');
  });

  // TC-02-035: ทดสอบการค้นหา Holiday กรณีไม่มีข้อมูลในระบบ
  test('TC-02-035: Search Holiday with no system data', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.searchHoliday({ field: 'Holiday Year', operator: '=', value: '1900' });
    await helper.takeScreenshot('screenshots/TC-02-035/01-empty_system_search.png');
    await helper.clickButton('Export');
  });

  // TC-02-036: ทดสอบการสร้าง Holiday โดยกรอกข้อมูลครบถูกต้องและกดบันทึก
  test('TC-02-036: Create Holiday with complete data and save', async ({ page }) => {
    await test.step('Navigate to Create Holiday', async () => {
      await helper.navigateToHolidayCalendar();
      await helper.clickButton('Create');
      await helper.takeScreenshot('screenshots/TC-02-036/01-create_page.png');
    });

    await test.step('Select Holiday Year 2026', async () => {
      const yearSelector = 'select[name="year"], input[name="year"], .year-selector';
      try {
        if (await page.locator(yearSelector).count() > 0) {
          await page.selectOption(yearSelector, '2026');
        }
      } catch (error) {
        console.log('Could not select year:', error);
      }
      await helper.takeScreenshot('screenshots/TC-02-036/02-select_year.png');
    });

    await test.step('Fill holiday information', async () => {
      await helper.fillHolidayForm({
        nameEN: 'New Year Day',
        nameTH: 'วันขึ้นปีใหม่',
        date: '01/01/2026',
        description: 'New Year Holiday 2026'
      });
      await helper.takeScreenshot('screenshots/TC-02-036/03-fill_form.png');
    });

    await test.step('Add and Save holiday', async () => {
      await helper.clickButton('Add');
      await page.waitForTimeout(1000);
      await helper.takeScreenshot('screenshots/TC-02-036/04-add_holiday.png');
      
      await helper.clickButton('Save');
      await helper.takeScreenshot('screenshots/TC-02-036/05-save_holiday.png');
    });

    await test.step('Confirm save', async () => {
      if (await helper.waitForConfirmationPopup()) {
        await helper.clickButton('Confirm');
        await helper.takeScreenshot('screenshots/TC-02-036/06-confirm_save.png');
      }
    });
  });

  // TC-02-037: ทดสอบการสร้าง Holiday โดยเพิ่มวันหยุด กด save และกดยกเลิก
  test('TC-02-037: Create Holiday add data, save and cancel', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: 'Test Holiday Cancel',
      nameTH: 'ทดสอบยกเลิก',
      date: '02/02/2026',
      description: 'Test cancel functionality'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Cancel');
      await helper.takeScreenshot('screenshots/TC-02-037/01-cancel_save.png');
    }
  });

  // TC-02-038: ทดสอบการสร้าง Holiday โดย add ข้อมูลวันหยุดและกดย้อนกลับ และกด confirm
  test('TC-02-038: Create Holiday add data, back and confirm', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: 'Test Holiday Back',
      nameTH: 'ทดสอบย้อนกลับ',
      date: '03/03/2026',
      description: 'Test back functionality'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Back');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Confirm');
      await helper.takeScreenshot('screenshots/TC-02-038/01-confirm_back.png');
    }
  });

  // TC-02-039: ทดสอบการสร้าง Holiday โดย add ข้อมูลวันหยุดและกดย้อนกลับ และกด cancel
  test('TC-02-039: Create Holiday add data, back and cancel', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: 'Test Holiday Back Cancel',
      nameTH: 'ทดสอบย้อนกลับยกเลิก',
      date: '04/04/2026',
      description: 'Test back cancel functionality'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Back');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Cancel');
      await helper.takeScreenshot('screenshots/TC-02-039/01-cancel_back.png');
    }
  });

  // TC-02-040: ทดสอบการสร้าง Holiday โดย addข้อมูลวันหยุด (ยังไม่มีวันหยุดก่อน)
  test('TC-02-040: Create Holiday add data without existing holidays', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    // Select year with no existing holidays
    const yearSelector = 'select[name="year"], input[name="year"], .year-selector';
    try {
      if (await page.locator(yearSelector).count() > 0) {
        await page.selectOption(yearSelector, '2027');
      }
    } catch (error) {
      console.log('Could not select year:', error);
    }
    
    await helper.fillHolidayForm({
      nameEN: 'First Holiday',
      nameTH: 'วันหยุดแรก',
      date: '01/01/2027',
      description: 'First holiday of the year'
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-040/01-first_holiday_added.png');
  });

  // TC-02-041: ทดสอบการสร้าง Holiday โดยกรอกข้อมูลวันหยุดแล้วไม่กด add วันหยุด
  test('TC-02-041: Create Holiday fill data without clicking add', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: 'No Add Holiday',
      nameTH: 'ไม่กด Add',
      date: '05/05/2026',
      description: 'Test without clicking add'
    });
    
    // Skip Add button and try to save directly
    await helper.clickButton('Save');
    await helper.takeScreenshot('screenshots/TC-02-041/01-save_without_add.png');
  });

  // TC-02-042: ทดสอบการสร้าง Holiday โดยกรอกข้อมูลและกดเคลียร์และกดบันทึก
  test('TC-02-042: Create Holiday fill data, clear and save', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: 'Clear Test Holiday',
      nameTH: 'ทดสอบเคลียร์',
      date: '06/06/2026',
      description: 'Test clear functionality'
    });
    
    await helper.clickButton('Clear');
    await helper.takeScreenshot('screenshots/TC-02-042/01-after_clear.png');
    
    await helper.clickButton('Save');
    await helper.takeScreenshot('screenshots/TC-02-042/02-save_after_clear.png');
  });

  // TC-02-043: ทดสอบการสร้าง Holiday โดยกดบันทึกแล้ว system error
  test('TC-02-043: Create Holiday save with system error', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    // Create scenario that might cause system error
    await helper.fillHolidayForm({
      nameEN: 'Error Test Holiday',
      nameTH: 'ทดสอบ Error',
      date: 'invalid-date',
      description: 'Test system error'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    
    // Check for error message
    await page.waitForTimeout(2000);
    await helper.takeScreenshot('screenshots/TC-02-043/01-system_error.png');
  });

  // TC-02-044: ทดสอบการสร้าง Holiday โดยกรอกข้อมูลไม่ถูกต้อง และกด add เพิ่มวันหยุด
  test('TC-02-044: Create Holiday with incorrect data and add', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    await helper.fillHolidayForm({
      nameEN: '', // Empty required field
      nameTH: 'ข้อมูลผิด',
      date: '99/99/2026', // Invalid date
      description: 'Test incorrect data'
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-044/01-incorrect_data_error.png');
  });

  // TC-02-045: ทดสอบการสร้าง Holiday โดยกรอก Holiday year ซ้ำกับข้อมูลที่มีอยู่แล้ว
  test('TC-02-045: Create Holiday with duplicate year', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    // Select existing year
    const yearSelector = 'select[name="year"], input[name="year"], .year-selector';
    try {
      if (await page.locator(yearSelector).count() > 0) {
        await page.selectOption(yearSelector, '2024'); // Assuming 2024 exists
      }
    } catch (error) {
      console.log('Could not select year:', error);
    }
    
    await helper.fillHolidayForm({
      nameEN: 'Duplicate Year Holiday',
      nameTH: 'วันหยุดปีซ้ำ',
      date: '07/07/2024',
      description: 'Test duplicate year'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    await helper.takeScreenshot('screenshots/TC-02-045/01-duplicate_year_error.png');
  });

  // TC-02-046: ทดสอบการสร้าง Holiday โดยไม่กรอกข้อมูล Required Field
  test('TC-02-046: Create Holiday without required fields', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('Create');
    
    // Try to add without filling required fields
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-046/01-required_field_error.png');
  });

  // TC-02-047: ทดสอบการแก้ไข Holiday โดยเพิ่มวันหยุดกดบันทึก และกดconfirm
  test('TC-02-047: Edit Holiday add data, save and confirm', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit Test Confirm',
      nameTH: 'แก้ไขทดสอบยืนยัน',
      date: '08/08/2026',
      description: 'Edit test with confirm'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Confirm');
      await helper.takeScreenshot('screenshots/TC-02-047/01-edit_confirm.png');
    }
  });

  // TC-02-048: ทดสอบการแก้ไข Holiday โดยกรอกข้อมูลครบถูกต้องกดบันทึกและยกเลิก
  test('TC-02-048: Edit Holiday complete data save and cancel', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit Test Cancel',
      nameTH: 'แก้ไขทดสอบยกเลิก',
      date: '09/09/2026',
      description: 'Edit test with cancel'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Cancel');
      await helper.takeScreenshot('screenshots/TC-02-048/01-edit_cancel.png');
    }
  });

  // TC-02-049: ทดสอบการแก้ไข Holiday โดยเพิ่มข้อมูลวันหยุดและกดย้อนกลับและกดconfirm
  test('TC-02-049: Edit Holiday add data, back and confirm', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit Back Confirm',
      nameTH: 'แก้ไขย้อนกลับยืนยัน',
      date: '10/10/2026',
      description: 'Edit back confirm test'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Back');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Confirm');
      await helper.takeScreenshot('screenshots/TC-02-049/01-edit_back_confirm.png');
    }
  });

  // TC-02-050: ทดสอบการแก้ไข Holiday โดยเพิ่มข้อมูลวันหยุดและกดย้อนกลับและกดcancel
  test('TC-02-050: Edit Holiday add data, back and cancel', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit Back Cancel',
      nameTH: 'แก้ไขย้อนกลับยกเลิก',
      date: '11/11/2026',
      description: 'Edit back cancel test'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Back');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Cancel');
      await helper.takeScreenshot('screenshots/TC-02-050/01-edit_back_cancel.png');
    }
  });

  // TC-02-051: ทดสอบการแกไข Holiday โดยเพิ่มข้อมูลวันหยุดแล้วไม่กด Add
  test('TC-02-051: Edit Holiday add data without clicking Add', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit No Add',
      nameTH: 'แก้ไขไม่กด Add',
      date: '12/12/2026',
      description: 'Edit without add test'
    });
    
    // Skip Add and try to save directly
    await helper.clickButton('Save');
    await helper.takeScreenshot('screenshots/TC-02-051/01-edit_no_add.png');
  });

  // TC-02-052: ทดสอบการแก้ไข Holiday โดยกรอกข้อมูลวันหยุดและกดเคลียร์และกดบันทึก
  test('TC-02-052: Edit Holiday fill data, clear and save', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Edit Clear Test',
      nameTH: 'แก้ไขทดสอบเคลียร์',
      date: '13/01/2026',
      description: 'Edit clear test'
    });
    
    await helper.clickButton('Clear');
    await helper.takeScreenshot('screenshots/TC-02-052/01-edit_after_clear.png');
    
    await helper.clickButton('Save');
    await helper.takeScreenshot('screenshots/TC-02-052/02-edit_save_after_clear.png');
  });

  // TC-02-053: ทดสอบการแก้ไข Holiday โดยลบข้อมูลวันหยุดและกดบันทึก
  test('TC-02-053: Edit Holiday delete data and save', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    // Find and delete existing holiday
    const deleteButton = page.locator('button:has-text("Delete"), .delete-btn, .btn-danger').first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await helper.takeScreenshot('screenshots/TC-02-053/01-delete_holiday.png');
    }
    
    await helper.clickButton('Save');
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Confirm');
      await helper.takeScreenshot('screenshots/TC-02-053/02-delete_confirm.png');
    }
  });

  // TC-02-054: ทดสอบการแก้ไข Holiday โดยลบข้อมูลวันหยุดและกดยกเลิกการลบ
  test('TC-02-054: Edit Holiday delete data and cancel delete', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    const deleteButton = page.locator('button:has-text("Delete"), .delete-btn, .btn-danger').first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await helper.takeScreenshot('screenshots/TC-02-054/01-delete_clicked.png');
    }
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Cancel');
      await helper.takeScreenshot('screenshots/TC-02-054/02-delete_cancelled.png');
    }
  });

  // TC-02-055: ทดสอบการแก้ไข Holiday โดยกดบันทึกแล้ว System Error
  test('TC-02-055: Edit Holiday save with system error', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    // Create invalid data scenario
    await helper.fillHolidayForm({
      nameEN: 'System Error Test',
      nameTH: 'ทดสอบ System Error',
      date: 'invalid-date-format',
      description: 'Test system error on edit'
    });
    
    await helper.clickButton('Add');
    await helper.clickButton('Save');
    await page.waitForTimeout(2000);
    await helper.takeScreenshot('screenshots/TC-02-055/01-edit_system_error.png');
  });

  // TC-02-056: ทดสอบการแก้ไข Holiday โดยเพิ่มข้อมูลผิด Format และกด add
  test('TC-02-056: Edit Holiday with wrong format data and add', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'Wrong Format Test',
      nameTH: 'ทดสอบ Format ผิด',
      date: '32/13/2026', // Invalid date format
      description: 'Test wrong format'
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-056/01-wrong_format_error.png');
  });

  // TC-02-057: ทดสอบการแก้ไข Holiday โดยการเพิ่ม Holiday Name ซ้ำกับข้อมูลที่มีอยู่
  test('TC-02-057: Edit Holiday with duplicate name', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    await helper.fillHolidayForm({
      nameEN: 'New Year Day', // Assuming this exists
      nameTH: 'วันขึ้นปีใหม่', // Duplicate name
      date: '14/01/2026',
      description: 'Test duplicate name'
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-057/01-duplicate_name_error.png');
  });

  // TC-02-058: ทดสอบการแก้ไข Holiday โดยไม่กรอกข้อมูล Required Field
  test('TC-02-058: Edit Holiday without required fields', async ({ page }) => {
    await helper.navigateToEditPage('2026');
    
    // Clear existing data and try to add without required fields
    await helper.fillHolidayForm({
      nameEN: '', // Empty required field
      nameTH: '',
      date: '',
      description: ''
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-058/01-edit_required_field_error.png');
  });

  // TC-02-059: ทดสอบการลบ Holiday กรณี Holiday year ปีปัจจุบัน แต่เลยวันหยุดแล้ว
  test('TC-02-059: Delete Holiday for current year past holiday date', async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();
    await helper.navigateToEditPage(currentYear);
    
    // Find holiday with past date
    const deleteButton = page.locator('button:has-text("Delete"), .delete-btn').first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await helper.takeScreenshot('screenshots/TC-02-059/01-delete_past_holiday.png');
    }
    
    if (await helper.waitForConfirmationPopup()) {
      await helper.clickButton('Confirm');
      await helper.takeScreenshot('screenshots/TC-02-059/02-delete_past_confirm.png');
    }
  });

  // TC-02-060: ทดสอบการแก้ไข Holiday กรณี Holiday year ปีเลยมาแล้ว
  test('TC-02-060: Edit Holiday for past year', async ({ page }) => {
    const pastYear = (new Date().getFullYear() - 1).toString();
    await helper.navigateToEditPage(pastYear);
    
    await helper.fillHolidayForm({
      nameEN: 'Past Year Holiday',
      nameTH: 'วันหยุดปีที่แล้ว',
      date: `01/01/${pastYear}`,
      description: 'Test past year edit'
    });
    
    await helper.clickButton('Add');
    await helper.takeScreenshot('screenshots/TC-02-060/01-past_year_edit.png');
  });

  // TC-02-061: ทดสอบ View ดูข้อมูล Holiday และ กด Back
  test('TC-02-061: View Holiday data and click Back', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.takeScreenshot('screenshots/TC-02-061/01-main_page.png');
    
    const viewButton = page.locator('button:has-text("View"), .action-view, .btn-view').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForLoadState('networkidle');
      await helper.takeScreenshot('screenshots/TC-02-061/02-view_page.png');
    }
    
    await helper.clickButton('Back');
    await helper.takeScreenshot('screenshots/TC-02-061/03-back_to_main.png');
  });

  // TC-02-062: ทดสอบ View ดูข้อมูล Holiday และกด Edit
  test('TC-02-062: View Holiday data and click Edit', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    
    const viewButton = page.locator('button:has-text("View"), .action-view, .btn-view').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForLoadState('networkidle');
      await helper.takeScreenshot('screenshots/TC-02-062/01-view_page.png');
    }
    
    await helper.clickButton('Edit');
    await page.waitForLoadState('networkidle');
    await helper.takeScreenshot('screenshots/TC-02-062/02-edit_from_view.png');
  });

  // TC-02-063: ทดสอบ View ดูข้อมูล Holiday และกด Export
  test('TC-02-063: View Holiday data and click Export', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    
    const viewButton = page.locator('button:has-text("View"), .action-view, .btn-view').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForLoadState('networkidle');
      await helper.takeScreenshot('screenshots/TC-02-063/01-view_page.png');
    }
    
    await helper.clickButton('Export');
    await helper.takeScreenshot('screenshots/TC-02-063/02-export_from_view.png');
  });

  // TC-02-064: ทดสอบค้นหาข้อมูลวันหยุด View Calendar โดยเลือก Date เป็นวันที่มีวันหยุด
  test('TC-02-064: View Calendar search by date with holiday', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('View Calendar');
    await page.waitForLoadState('networkidle');
    await helper.takeScreenshot('screenshots/TC-02-064/01-calendar_view.png');
    
    // Select date with holiday (e.g., New Year)
    const dateSelector = 'input[type="date"], .date-picker, .ant-picker-input input';
    try {
      if (await page.locator(dateSelector).count() > 0) {
        await page.fill(dateSelector, '2024-01-01');
      }
    } catch (error) {
      console.log('Could not fill date:', error);
    }
    
    await helper.clickButton('Search');
    await helper.takeScreenshot('screenshots/TC-02-064/02-holiday_date_search.png');
  });

  // TC-02-065: ทดสอบค้นหาข้อมูลวันหยุด View Calendar โดยเลือก เป็นวันที่ start date และ end date
  test('TC-02-065: View Calendar search by date range', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('View Calendar');
    await page.waitForLoadState('networkidle');
    await helper.takeScreenshot('screenshots/TC-02-065/01-calendar_view.png');
    
    // Set date range
    const startDateSelector = 'input[name="startDate"], .start-date';
    const endDateSelector = 'input[name="endDate"], .end-date';
    
    try {
      if (await page.locator(startDateSelector).count() > 0) {
        await page.fill(startDateSelector, '2024-01-01');
      }
      if (await page.locator(endDateSelector).count() > 0) {
        await page.fill(endDateSelector, '2024-12-31');
      }
    } catch (error) {
      console.log('Could not fill date range:', error);
    }
    
    await helper.clickButton('Search');
    await helper.takeScreenshot('screenshots/TC-02-065/02-date_range_search.png');
  });

  // TC-02-066: ทดสอบค้นหาข้อมูลวันหยุด View Calendar โดยเลือก Date ไม่เลือกปี
  test('TC-02-066: View Calendar search by date without year', async ({ page }) => {
    await helper.navigateToHolidayCalendar();
    await helper.clickButton('View Calendar');
    await page.waitForLoadState('networkidle');
    await helper.takeScreenshot('screenshots/TC-02-066/01-calendar_view.png');
    
    // Select date without specifying year
    const dateSelector = 'input[type="date"], .date-picker, .ant-picker-input input';
    try {
      if (await page.locator(dateSelector).count() > 0) {
        await page.fill(dateSelector, '01-01'); // Date without year
      }
    } catch (error) {
      console.log('Could not fill date without year:', error);
    }
    
    await helper.clickButton('Search');
    await helper.takeScreenshot('screenshots/TC-02-066/02-date_no_year_search.png');
  });
});

// Helper function for waiting and screenshot
async function waitAndScreenshot(page: Page, selector: string, screenshotPath: string, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (error) {
    console.log(`Element ${selector} not found, taking screenshot anyway`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    throw error;
  }
}