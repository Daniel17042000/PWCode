// playwright.config.js
// Central place to control which browser all specs run in - this is the
// single-source-of-truth equivalent of `new ChromeDriver(...)` in the Java
// tests. Nothing in the individual spec files needs to change.

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: '**/*.spec.js',

  // Don't run specs in parallel - these tests log in as different users and
  // drive shared workflow state through the UI (same reasoning as the
  // --workers=1 note from before).
  fullyParallel: false,
  workers: 1,

  timeout: 300_000, // 5 min per test, matches the longer specs' setTimeout

  reporter: [['html', { open: 'never' }]],

  use: {
    // headless: false => a visible browser window opens, like --headed did.
    headless: false,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        // channel: 'chrome' launches the real, locally installed Google
        // Chrome (not Playwright's bundled Chromium) - closest match to the
        // Java tests' `new ChromeDriver()`. Comment this line out if you'd
        // rather use the bundled Chromium instead of system Chrome.
        channel: 'chrome',
      },
    },
  ],
});