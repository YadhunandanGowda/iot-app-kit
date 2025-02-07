import { test, expect } from '@playwright/test';

const TEST_PAGE = '/?path=/story/widgets-kpi-kpi-base--main';
const TEST_IFRAME = '#storybook-preview-iframe';
const COMPONENT_SELECTOR = '.kpi';

test('kpi', async ({ page }) => {
  await page.goto(TEST_PAGE);
  await page.evaluate(() => document.fonts.ready);

  const frame = page.frameLocator(TEST_IFRAME); // Need to go into frame otherwise the `locator` won't locate the selection.

  // KPI will always show value shows value
  await expect(frame.locator(COMPONENT_SELECTOR)).toContainText('100');
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('default.png');

  // unit will display
  const unit = 'mph';
  await page.goto(`${TEST_PAGE}&args=unit:${unit}`);
  await expect(frame.locator(COMPONENT_SELECTOR)).toContainText(unit);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('unit.png');

  // name will display
  const name = 'windmill-name';
  await page.goto(`${TEST_PAGE}&args=name:${name}`);
  await expect(frame.locator(COMPONENT_SELECTOR)).toContainText(name);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('name.png');

  // displays as loading
  await page.goto(`${TEST_PAGE}&args=isLoading:true`);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('loading.png');

  // error will display
  const errorMsg = 'my-custom-error-msg';
  await page.goto(`${TEST_PAGE}&args=error:${errorMsg}`);
  await expect(frame.locator(COMPONENT_SELECTOR)).toContainText(errorMsg);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('error.png');

  // font-sizes can be customized
  await page.goto(`${TEST_PAGE}&args=fontSize:70;secondaryFontSize:30`);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('custom-font-sizes.png');

  // displays icon
  await page.goto(`${TEST_PAGE}&args=icon:acknowledged`);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('icon.png');

  // displays empty state
  await page.goto(`${TEST_PAGE}&args=propertyPoint:!null`);
  await page.evaluate(() => document.fonts.ready);
  await expect(frame.locator(COMPONENT_SELECTOR)).toHaveScreenshot('empty-state.png');
});
