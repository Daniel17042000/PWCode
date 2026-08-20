// const { chromium } = require('playwright');

// (async () => {
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext({ viewport: null }); // null viewport lets --start-maximized work
//   const page = await context.newPage();node vehicleMaster.js
import { test, expect } from '@playwright/test';

test.use({
    ignoreHTTPSErrors: true,
    browserName: 'chromium'
});

test('Mannai test', async ({ page }) => {
    test.setTimeout(120000);

  // Set default timeout similar to implicit wait
  

  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');

  // ---- Login page ----
  await page.locator('#P9999_USERNAME').fill('Daniel');
  await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
  await page.locator('#P9999_REMEMBER').click();
  await page.locator("//span[text()='Sign In']").click();

  // ---- Mannai dashboard ----
  await page.locator("//span[@class='t-Icon fa fa-random']").click();
  await page.locator("//a[text()='Salesman MAR - Mannai Auto Rent']").click();

  await page.getByRole('link', { name: 'Mannai Auto Rent', exact: true }).click();
  await page.getByRole('link', { name: 'Transaction', exact: true }).click();
  await page.getByRole('link', { name: 'Vehicle Master', exact: true }).click();
  await page.locator("//span[text()='New']").click();

  // ---- Create new vehicle -- VEHICLE INFORMATION ----
  await page.locator('#P1042_CM_VEH_TYPE').click();
  await page.locator("//option[text()='Third Party']").click();
  await page.locator("//input[@id='P1042_CM_REG_NO']").fill('TN 45 A 0008');
  await page.locator('#P1042_CM_SUPPLIER_CONTAINER').click();
  await page.locator("//td[normalize-space()='Venue Corporation and co']").click();
  await page.locator("//input[@id='P1042_CM_MODEL_ID']").click();
  await page.locator("//td[normalize-space()='Venue UCD Make']").click();
  await page.locator("//input[@id='P1042_CM_CHASSIS_NO_DISPLAY']").fill('789QWER');
  await page.locator("//button[@id='P1042_CM_USAGE_ID_lov_btn']").click();
  await page.locator("//td[text()='01']").click();
  await page.locator("//input[@id='P1042_CM_ENGINE_NO']").fill('123Test');
  await page.locator("//input[@id='P1042_CM_PARK_LOC_ID']").click();
  await page.locator("//td[normalize-space()='Loc Testing']").click();
  await page.locator("//input[@id='P1042_CM_CURRENT_KM']").fill('100');
  await page.locator("//input[@id='P1042_CM_CLASS_ID']").click();
  await page.locator("//td[text()='6']").click();
  await page.locator("//input[@id='P1042_CM_GROUP_ID']").click();
  await page.locator("//td[normalize-space()='June Group']").click();
  await page.locator("//input[@id='P1042_CM_TANK_CAPACITY']").fill('20');
  await page.locator("//input[@id='P1042_CM_FUEL_TYPE_ID']").click();
  await page.locator("//td[normalize-space()='Desiel']").click();
  await page.locator("//input[@id='P1042_CM_CAR_DESC']").fill('Test');

  // ---- Purchase / Depreciation / Disposed ----
  await page.locator("//input[@id='P1042_CM_PURCHASE_DATE_input']").click();
  await page.locator("//button[text()='Today']").click();
  await page.locator("//input[@id='P1042_CM_PURCHASE_VALUE']").fill('1');
  await page.locator("//input[@id='P1042_CM_DEP_RATE']").fill('2');

  // ---- Maintenance ----
  await page.locator("//input[@id='P1042_CM_TYRE_CHANGE_DATE_input']").fill('31-JUL-2026');
  await page.locator("//input[@id='P1042_CM_TYRE_CHANGE_KM']").click();
  await page.locator("//input[@id='P1042_CM_MAINT_DUE_DATE_input']").fill('31-JUL-2026');
  await page.locator("//input[@id='P1042_CM_MAINT_DUE_DATE_input']").press('Tab');
  // await page.locator("//input[@id='P1042_CM_KEY_NO']").fill('11');
  // await page.locator("//input[@id='P1042_CM_KEY_NO']").press('Tab');

  // ---- Save ----
  await page.locator("//span[@class='t-Button-label'][text()='Save']").click();

  // await browser.close();
})