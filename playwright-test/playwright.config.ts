import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Enhanced Playwright Configuration
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel - disabled for better debugging */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,

  /* Reporter configuration with multiple reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],

  /* Global timeout for tests */
  timeout: 120000, // 2 minutes per test

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL - set to the application under test */
    baseURL: 'http://billing-sit-web.symc.net.th',

    /* Collect trace and video for better debugging */
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    /* Action timeout */
    actionTimeout: 30000, // 30 seconds for actions

    /* Navigation timeout */
    navigationTimeout: 60000, // 1 minute for page navigations

    /* Ignore HTTPS errors for internal testing */
    ignoreHTTPSErrors: true,

    /* Set user agent */
    userAgent: 'PlaywrightTestSuite/1.0',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optimized viewport for the application
        viewport: { width: 1920, height: 1080 },
        // Browser context options
        contextOptions: {
          // Ignore certificate errors for internal testing
          ignoreHTTPSErrors: true,
          // Set permissions
          permissions: ['geolocation', 'notifications'],
        },
      },
    },

    // Firefox configuration (commented out, uncomment if needed)
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },

    // Safari configuration (commented out, uncomment if needed)
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },
  ],

  /* Global setup and teardown */
  // globalSetup: require.resolve('./global-setup'),
  // globalTeardown: require.resolve('./global-teardown'),

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Configure test metadata */
  metadata: {
    'test-suite': 'Holiday Calendar Tests',
    'environment': 'SIT',
    'application': 'Billing System',
  },

  /* Web server configuration (if needed) */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
