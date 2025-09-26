/**
 * Thai-English translation mappings for UI elements
 * Centralized translation management for consistent UI interactions
 */

export const UI_TRANSLATIONS = {
  // Button labels
  BUTTONS: {
    'Add': 'เพิ่ม',
    'Save': 'บันทึก',
    'Back': 'ย้อนกลับ',
    'Cancel': 'ยกเลิก',
    'Confirm': 'ยืนยัน',
    'Clear': 'เคลียร์',
    'Edit': 'แก้ไข',
    'OK': 'ตกลง',
    'Close': 'ปิด',
    'Create': 'สร้าง',
    'Delete': 'ลบ',
    'Update': 'อัปเดต',
    'Login': 'เข้าสู่ระบบ',
    'Logout': 'ออกจากระบบ',
    'Yes': 'ใช่',
    'No': 'ไม่',
  },

  // Field labels
  FIELDS: {
    'Year': 'ปี',
    'Holiday Name EN': 'ชื่อวันหยุดภาษาอังกฤษ',
    'Holiday Name TH': 'ชื่อวันหยุดภาษาไทย',
    'Holiday Date': 'วันที่หยุด',
    'Holiday Description': 'รายละเอียดวันหยุด',
    'Description': 'รายละเอียด',
  },

  // Messages and alerts
  MESSAGES: {
    'Error': 'ข้อผิดพลาด',
    'Warning': 'คำเตือน',
    'Success': 'สำเร็จ',
    'Information': 'ข้อมูล',
    'Please add at least one holiday': 'กรุณาเพิ่มวันหยุดอย่างน้อยหนึ่งวัน',
    'Data saved successfully': 'บันทึกข้อมูลเรียบร้อยแล้ว',
    'Are you sure?': 'คุณแน่ใจหรือไม่?',
    'Confirm delete': 'ยืนยันการลบ',
    'Unsaved changes': 'การเปลี่ยนแปลงที่ไม่ได้บันทึก',
    'Loading': 'กำลังโหลด',
    'Please wait': 'กรุณารอสักครู่',
  },

  // Page titles and headers
  PAGE_TITLES: {
    'Create Holidays Calendar': 'สร้างปฏิทินวันหยุด',
    'Edit Holidays Calendar': 'แก้ไขปฏิทินวันหยุด',
    'Holidays Calendar Master': 'ข้อมูลหลักปฏิทินวันหยุด',
    'Holiday Calendar': 'ปฏิทินวันหยุด',
    'Master': 'ข้อมูลหลัก',
    'Home': 'หน้าแรก',
  },

  // Navigation and menu items
  NAVIGATION: {
    'Master': 'ข้อมูลหลัก',
    'Holidays Calendar Master': 'ข้อมูลหลักปฏิทินวันหยุด',
    'Dashboard': 'แดชบอร์ด',
    'Settings': 'การตั้งค่า',
    'Profile': 'โปรไฟล์',
  },

  // Validation messages
  VALIDATION: {
    'Input Numbers only': 'กรอกเฉพาะตัวเลขเท่านั้น',
    'Thai characters only': 'กรอกเฉพาะตัวอักษรภาษาไทยเท่านั้น',
    'English characters only': 'กรอกเฉพาะตัวอักษรภาษาอังกฤษเท่านั้น',
    'Required field': 'ช่องข้อมูลที่จำเป็น',
    'Invalid format': 'รูปแบบไม่ถูกต้อง',
    'Date required': 'จำเป็นต้องระบุวันที่',
    'Invalid date': 'วันที่ไม่ถูกต้อง',
  },
} as const;

/**
 * Gets Thai translation for English text
 * @param englishText - English text to translate
 * @param category - Translation category (optional)
 * @returns Thai translation or original text if not found
 */
export function getThaiTranslation(
  englishText: string,
  category?: keyof typeof UI_TRANSLATIONS
): string {
  if (category && UI_TRANSLATIONS[category] && englishText in UI_TRANSLATIONS[category]) {
    return (UI_TRANSLATIONS[category] as any)[englishText];
  }

  // Search in all categories if no specific category provided
  for (const categoryData of Object.values(UI_TRANSLATIONS)) {
    if (englishText in categoryData) {
      return (categoryData as any)[englishText];
    }
  }

  return englishText; // Return original if no translation found
}

/**
 * Gets English translation for Thai text
 * @param thaiText - Thai text to translate
 * @param category - Translation category (optional)
 * @returns English translation or original text if not found
 */
export function getEnglishTranslation(
  thaiText: string,
  category?: keyof typeof UI_TRANSLATIONS
): string {
  const searchInCategory = (categoryData: Record<string, string>) => {
    for (const [english, thai] of Object.entries(categoryData)) {
      if (thai === thaiText) {
        return english;
      }
    }
    return null;
  };

  if (category && UI_TRANSLATIONS[category]) {
    const result = searchInCategory(UI_TRANSLATIONS[category] as Record<string, string>);
    if (result) return result;
  }

  // Search in all categories if no specific category provided
  for (const categoryData of Object.values(UI_TRANSLATIONS)) {
    const result = searchInCategory(categoryData as Record<string, string>);
    if (result) return result;
  }

  return thaiText; // Return original if no translation found
}

/**
 * Creates an array of selectors with both English and Thai text
 * @param englishText - English text
 * @param category - Translation category (optional)
 * @returns Array of selectors with both languages
 */
export function createBilingualSelectors(
  englishText: string,
  category?: keyof typeof UI_TRANSLATIONS
): string[] {
  const thaiText = getThaiTranslation(englishText, category);

  return [
    `button:has-text("${englishText}")`,
    `button:has-text("${thaiText}")`,
    `text="${englishText}"`,
    `text="${thaiText}"`,
    `[aria-label="${englishText}"]`,
    `[aria-label="${thaiText}"]`,
    `[title="${englishText}"]`,
    `[title="${thaiText}"]`,
  ];
}