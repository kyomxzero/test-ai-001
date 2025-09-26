/**
 * Constants for the Playwright test suite
 * Contains URLs, selectors, test data, and timeouts
 */

// Base URLs
export const BASE_URLS = {
  LOGIN: 'http://billing-sit-web.symc.net.th/login',
  HOME: 'http://billing-sit-web.symc.net.th/billing/home',
  HOLIDAYS_CALENDAR: 'http://billing-sit-web.symc.net.th/billing/master/holidays-calendar',
  HOLIDAYS_CALENDAR_EDIT: (year: string) => `http://billing-sit-web.symc.net.th/billing/master/holidays-calendar/Edit/${year}`,
} as const;

// Selectors
export const SELECTORS = {
  // Login selectors
  LOGIN: {
    USER_BUTTON: 'text=user1',
    LOGIN_BUTTON: 'button:has-text("เข้าสู่ระบบ")',
    ALTERNATIVE_USER_SELECTORS: ['[data-testid="user1"]', 'button:has-text("user1")', '.user-item:has-text("user1")'],
    ALTERNATIVE_LOGIN_SELECTORS: ['[data-testid="login-button"]', 'button[type="submit"]', '.login-btn'],
  },

  // Form field selectors
  FORM_FIELDS: {
    HOLIDAY_NAME_EN: [
      'input[placeholder*="specify the holiday name in English"]',
      'input[placeholder*="English"]',
      'input:near(:text("Holiday Name EN"))',
      'form input[type="text"]:nth-of-type(1)',
      'label:has-text("Holiday Name EN") + input',
    ],
    HOLIDAY_NAME_TH: [
      'input[placeholder*="specify the holiday name in Thai"]',
      'input[placeholder*="Thai"]',
      'input:near(:text("Holiday Name TH"))',
      'form input[type="text"]:nth-of-type(2)',
      'label:has-text("Holiday Name TH") + input',
    ],
    HOLIDAY_DATE: [
      'input[placeholder*="Please select date"]',
      'input[placeholder*="select date"]',
      'input[type="date"]',
      'input:near(:text("Holiday Date"))',
      '.ant-picker-input input',
      'label:has-text("Holiday Date") + input',
    ],
    HOLIDAY_DESCRIPTION: [
      'textarea[placeholder*="Enter description"]',
      'textarea[placeholder*="description"]',
      'textarea:near(:text("Holiday Description"))',
      'form textarea',
      'label:has-text("Holiday Description") + textarea',
    ],
  },

  // Button selectors
  BUTTONS: {
    ADD: [
      'button:has-text("Add")',
      'button:has-text("เพิ่ม")',
      'button[type="submit"]',
      'button:near(:text("Add"))',
      '.btn:has-text("Add")',
    ],
    SAVE: [
      'button:has-text("Save")',
      'button:has-text("บันทึก")',
      '.btn-primary',
      'button:near(:text("Save"))',
      '[data-testid="save-button"]',
    ],
    BACK: [
      'button:has-text("Back")',
      'button:has-text("ย้อนกลับ")',
      '[data-testid="back-button"]',
      'button[class*="back"]',
      '.btn:has-text("Back")',
    ],
    CANCEL: [
      'button:has-text("Cancel")',
      'button:has-text("ยกเลิก")',
      '.swal2-cancel',
      '[data-testid="cancel-button"]',
      'button[class*="cancel"]',
    ],
    CONFIRM: [
      'button:has-text("Confirm")',
      'button:has-text("ยืนยัน")',
      'button:has-text("OK")',
      'button:has-text("Yes")',
      'button:has-text("ใช่")',
      '.swal2-confirm',
      '[data-testid="confirm-button"]',
    ],
    CLEAR: [
      'button:has-text("Clear")',
      'button:has-text("เคลียร์")',
      '[data-testid="clear-button"]',
      'button[class*="clear"]',
      '.btn:has-text("Clear")',
    ],
    DELETE: [
      'button:has-text("Delete")',
      'button:has-text("ลบ")',
      '[data-testid="delete-button"]',
      'button[class*="delete"]',
      '.btn:has-text("Delete")',
      'button:has-text("Remove")',
    ],
  },

  // Popup and modal selectors
  POPUPS: {
    CONFIRMATION: [
      '.swal2-popup',
      '.modal',
      '.popup',
      '.confirm-dialog',
      '[role="dialog"]',
      '.ant-modal',
      '.confirmation-popup',
    ],
    WARNING_MESSAGES: [
      '.swal2-popup .swal2-title',
      '.swal2-popup .swal2-content',
      '.alert-warning',
      '.alert-danger',
      '.ant-message-warning',
      '.ant-message-error',
      'text=/warning|เตือน|error|ข้อผิดพลาด|กรุณา|please/i',
    ],
  },

  // Page title selectors
  PAGE_TITLES: {
    EDIT_HOLIDAY: [
      'text=Edit Holidays Calendar',
      'h1:has-text("Edit")',
      '[data-testid="edit-holiday"]',
      '.edit-page',
    ],
    HOLIDAY_CALENDAR_MASTER: [
      'text=Holidays Calendar Master',
      'text=Holiday Calendar',
      'text=Holidays Calendar',
    ],
  },
} as const;

// Test data
export const TEST_DATA = {
  YEARS: {
    EDIT_YEAR: '2026',
    FUTURE_YEAR: '2027',
    CLEAR_TEST_YEAR: '2028',
  },

  HOLIDAY_SAMPLES: {
    NEW_YEAR: {
      nameEN: 'New Year Day Test',
      nameTH: 'วันขึ้นปีใหม่ทดสอบ',
      date: '01/01/2026',
      description: 'Test holiday description for automation',
    },
    BACK_NAV_TEST: {
      nameEN: 'Test Holiday Back Navigation',
      nameTH: 'ทดสอบการย้อนกลับ',
      date: '15/08/2026',
      description: 'Test holiday for back navigation functionality',
    },
    CLEAR_TEST: {
      nameEN: 'Test Holiday Clear Data',
      nameTH: 'ทดสอบการเคลียร์ข้อมูล',
      date: '01/05/2026',
      description: 'Test holiday data for clear functionality testing',
    },
  },
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 2000,
  LONG: 5000,
  VERY_LONG: 10000,
  PAGE_LOAD: 30000,
} as const;

// Screenshot paths
export const SCREENSHOT_PATHS = {
  BASE: 'screenshots',
  getTestPath: (testCase: string, step: string, description: string) =>
    `screenshots/${testCase}/${testCase}_${step}_${description}.png`,
} as const;