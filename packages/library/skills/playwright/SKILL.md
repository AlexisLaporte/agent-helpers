---
name: Playwright
description: Browser automation and end-to-end testing. Use when user wants to test web applications, automate browser interactions, scrape web content, or verify UI functionality across browsers.
source: base
---

# Playwright

Automate browsers and test web applications with Playwright.

## When to Use

Use this skill when the user wants to:
- Write or run end-to-end tests for web applications
- Automate browser interactions (clicks, forms, navigation)
- Test across multiple browsers (Chromium, Firefox, WebKit)
- Capture screenshots or videos of web pages
- Scrape or extract data from websites
- Test responsive designs or mobile viewports
- Verify accessibility features

## Installation

```bash
npm install -D @playwright/test
npx playwright install
```

## Basic Usage

### Create a test file

```javascript
// tests/example.spec.js
const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```

### Run tests

```bash
npx playwright test
npx playwright test --headed    # See browser
npx playwright test --debug     # Debug mode
```

## Common Patterns

### Navigation and interaction

```javascript
// Navigate
await page.goto('https://example.com');

// Click elements
await page.click('button#submit');
await page.getByRole('button', { name: 'Submit' }).click();

// Fill forms
await page.fill('input[name="email"]', 'user@example.com');
await page.getByLabel('Password').fill('secret');

// Wait for elements
await page.waitForSelector('.result');
```

### Assertions

```javascript
// Page assertions
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('Dashboard');

// Element assertions
await expect(page.locator('.message')).toBeVisible();
await expect(page.locator('.count')).toHaveText('5 items');
await expect(page.getByRole('button')).toBeEnabled();
```

### Screenshots and videos

```javascript
// Screenshot
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'full-page.png', fullPage: true });

// Video (configure in playwright.config.js)
use: {
  video: 'on-first-retry',
}
```

### Multiple browsers

```javascript
// playwright.config.js
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## Configuration

Create `playwright.config.js`:

```javascript
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
};
```

## Best Practices

- Use `page.getByRole()`, `page.getByLabel()`, `page.getByText()` for robust selectors
- Wait for network idle: `await page.goto(url, { waitUntil: 'networkidle' })`
- Use test fixtures for setup/teardown
- Run tests in parallel: `npx playwright test --workers=4`
- Use `test.beforeEach()` for common setup
- Store test data in separate files or fixtures

## Common Issues

**Tests fail intermittently**: Add explicit waits
```javascript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 10000 });
```

**Element not found**: Use Playwright Inspector
```bash
npx playwright test --debug
```

**Slow tests**: Use parallel execution and optimize waits

## Resources

- Docs: https://playwright.dev
- API: https://playwright.dev/docs/api/class-playwright
- Selectors: https://playwright.dev/docs/selectors
- Best practices: https://playwright.dev/docs/best-practices
