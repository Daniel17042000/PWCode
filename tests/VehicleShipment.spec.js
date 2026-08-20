// vehicleShipment.spec.js
// Playwright/JS conversion of MAR.Mannai.VehicleShipment (Selenium/Java).
//
// See requisitionDemo.spec.js for general porting notes (frameLocator
// instead of switchTo().frame(), auto-waiting instead of
// WebDriverWait/ExpectedConditions, etc).

const { test, expect } = require('@playwright/test');
const { generateXCO } = require('./xcoUniqueConstrain');

test.use({
  launchOptions: {
    args: ['--disable-save-password-bubble', '--disable-notifications'],
  },
});

test('Vehicle Shipment', async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');

  await page.locator('#P9999_USERNAME').fill('Daniel');
  await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
  await page.locator("xpath=//button[.//span[text()='Sign In']]").click();
  console.log('Login Succesfully');

  await page.locator("xpath=//span[@class='t-Icon fa fa-random']").click();
  await page.locator("xpath=//a[text()='Salesman NVS - New Vehicle Sales']").click();

  await page.waitForTimeout(3000);

  await page.getByRole('link', { name: 'New Vehicle Sales', exact: true }).click();
  await page.locator("xpath=//a[normalize-space()='Transactions']").click();
  await page.locator("xpath=//a[@role='treeitem' and normalize-space()='Vehicle Shipment']").click();

  await page.locator("xpath=//span[text()='New']").click();

  await page.locator('#P96_SUPPLIER_ID_lov_btn').click();
  await page.locator("xpath=//td[text()='Venue Corporation and co']").click();

  await page.locator('#P96_BILL_OF_LADING').fill('TEST BILL');
  await page.locator('#P96_HOUSE_BILL_OF_LADING').fill('TEST BILL');
  await page.locator('#P96_SHIPMENT_PORT').fill('TEST BILL');
  await page.locator('#P96_VESSEL_NAME').fill('TEST BILL VESSEL 1');
  await page.locator('#P96_VOYAGE_NO').fill('5543');

  await page.locator("xpath=//span[text()='Save']").click();

  await page.waitForTimeout(1000);
  await page.locator("xpath=//span[text()='Pick Order']").click();

  // =========================================================
  // PICK ORDER IFRAME
  // =========================================================
  const pickOrderFrame = page.frameLocator("iframe[title='Pick Order  - Order Details']");
  console.log('Mouse has been moved to Iframe');

  await pickOrderFrame.locator('xpath=//tbody/tr[1]').first().waitFor({ state: 'attached' });

  // Find FIRST checkbox from FIRST data row
  const firstCheckbox = pickOrderFrame.locator("xpath=(//tbody/tr[1]//input[@type='checkbox'])[1]");
  await firstCheckbox.click();
  console.log('First checkbox selected');

  const copyButton = pickOrderFrame.locator("xpath=//button[normalize-space()='Copy']");
  await page.waitForTimeout(500);
  await copyButton.click();

  await page.waitForTimeout(1000);

  await page.locator("xpath=//img[@class='apex-edit-pencil']").click();

  // =========================================================
  // SHIPMENT IFRAME
  // =========================================================
  const shipmentFrame = page.frameLocator("iframe[title='Shipment']");

  const chassisNo = generateXCO();

  const chassis = shipmentFrame.locator('#P99_VM_CHASSIS_NO');
  await chassis.fill(chassisNo + 'TST');

  await shipmentFrame.locator('#P99_CASE_NO').fill('12');
  await shipmentFrame.locator('#P99_KEY_NO').fill('223');

  // =========================================================
  // UPDATE
  // =========================================================
  const updateButton = shipmentFrame.locator('#B206041506013389000');
  console.log('Update button found');

  await updateButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await updateButton.click({ force: true });

  console.log('Switched to Shipment iframe successfully');

  await page.waitForTimeout(1000);
  await page.locator("xpath=//span[text()='Finalize']").click();

  const finalizePopup = page.locator("xpath=//div[@role='alertdialog' and contains(@class,'ui-dialog')]");
  await finalizePopup.waitFor({ state: 'visible' });
  console.log('Finalize popup displayed');

  const confirmFinalize = finalizePopup.locator(
    "xpath=.//button[contains(@class,'js-confirmBtn') and normalize-space()='Finalize']"
  );

  await confirmFinalize.scrollIntoViewIfNeeded();
  await confirmFinalize.click({ force: true });

  console.log('Finalize confirmed successfully');
  console.log('Vehicle Shipment Finalized');
});