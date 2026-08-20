// orderCreationDemo.spec.js
// Playwright/JS conversion of MAR.Mannai.OrderCreationDemo (Selenium/Java).
//
// See requisitionDemo.spec.js for notes on the general porting approach
// (frameLocator instead of switchTo().frame(), auto-waiting instead of
// WebDriverWait/ExpectedConditions, etc). This file follows the same
// section-by-section structure as the original Java test.

const { test, expect } = require('@playwright/test');
const { waitForProcessingToClear, safeClick } = require('./utils');
const { generateXCO } = require('./xcoUniqueConstrain');

test.use({
  launchOptions: {
    args: ['--disable-save-password-bubble', '--disable-notifications'],
  },
});

test('Order Creation - New Request', async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');

  // =========================================================
  // LOGIN - DANIEL
  // =========================================================
  await page.locator('#P9999_USERNAME').fill('Daniel');
  await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
  await page.locator("xpath=//button[.//span[text()='Sign In']]").click();
  console.log('Login Successfully');

  // =========================================================
  // NAVIGATION TO ORDER CREATION
  // =========================================================
  await page.locator("xpath=//span[@class='t-Icon fa fa-random']").click();
  await page.locator("xpath=//a[text()='Salesman NVS - New Vehicle Sales']").click();

  await page.waitForTimeout(3000);

  await page.getByRole('link', { name: 'New Vehicle Sales', exact: true }).click();
  await page.locator("xpath=//a[normalize-space()='Transactions']").click();
  await page.locator("xpath=//a[@role='treeitem' and normalize-space()='Order Creation']").click();
  await page.locator('#B544739870020256357').click();

  // =========================================================
  // REQUISITION TYPE
  // =========================================================
  await page.locator('#P88_REQUISITION_TYPE').click();
  await page.locator("xpath=//li[normalize-space()='Fleet']").click();

  // =========================================================
  // SUPPLIER
  // =========================================================
  await page.locator('#P88_SITE_ID_lov_btn').click();

  const supplierPopup = page.locator('#PopupLov_88_P88_SITE_ID_dlg');
  await supplierPopup.waitFor({ state: 'visible' });

  const searchBox = supplierPopup.locator('input.a-PopupLOV-search');
  await searchBox.click();
  await searchBox.fill('Venu');

  await supplierPopup.locator('button.a-PopupLOV-doSearch').click();

  await page.locator('#PopupLov_88_P88_SITE_ID_dlg .a-PopupLOV-results').waitFor({ state: 'visible' });

  await page.locator("xpath=//td[normalize-space()='Qatar Riyals']").click();
  console.log('Supplier Selected');

  // =========================================================
  // SUPPLIER REFERENCE
  // =========================================================
  const supplierReference = page.locator('#P88_SUPPLIER_REFERENCE');
  await supplierReference.click();
  await supplierReference.fill('Test Reference');

  // =========================================================
  // PAYMENT TERMS
  // =========================================================
  await page.locator('#P88_PAYMENT_TERMS_lov_btn').click();
  await page.locator("xpath=//td[text()='01']").click();

  // =========================================================
  // TRADE TERMS
  // =========================================================
  await page.locator('#P88_TRADE_TERMS').click();
  await page.locator("xpath=//td[text()='12345']").click();

  // =========================================================
  // DELIVERY MODE
  // =========================================================
  await page.locator('#P88_DELIVERY_MODE').click();
  await page.locator("xpath=//td[text()='SEA']").click();

  // =========================================================
  // SAVE ORDER CREATION HEADER
  // =========================================================
  await page.locator("xpath=//span[normalize-space()='Save']").click();
  console.log('Order creation header created Successfully');

  await page.waitForTimeout(2000);

  // =========================================================
  // REQUEST DETAILS
  // =========================================================
  const requestDetailsButton = page.locator("xpath=//span[normalize-space()='Request Details']");
  await requestDetailsButton.scrollIntoViewIfNeeded();
  await requestDetailsButton.click();
  console.log('Request Details clicked successfully');

  // =========================================================
  // REQUISITION DETAILS IFRAME
  // =========================================================
  const requisitionFrame = page.frameLocator("iframe[title='Requisition Details']");

  const checkboxes = requisitionFrame.locator("xpath=//table//input[@type='checkbox']");
  const lastCheckbox = checkboxes.last();
  if (!(await lastCheckbox.isChecked())) {
    await lastCheckbox.click();
  }

  await requisitionFrame.locator("xpath=//span[text()='Convert Line']").click();
  console.log('Record copied from Request Details');

  // =========================================================
  // OPEN ORDER CREATION POPUP
  // =========================================================
  await page.locator("xpath=//img[contains(@class,'apex-edit-pencil') and @alt='Edit']").click();

  await page.waitForTimeout(1000);

  const orderCreationPopup = page.locator(
    "xpath=//div[@role='dialog' and .//h1[normalize-space()='Order Creation']]"
  );
  await orderCreationPopup.waitFor({ state: 'visible' });
  console.log('Order Creation popup displayed');

  const orderFrame = page.frameLocator("iframe[title='Order Creation']");
  console.log('Switched to Order Creation iframe');

  // =========================================================
  // EXTERIOR
  // =========================================================
  await orderFrame.locator('#P92_EXTERIOR_lov_btn').click();
  await page.locator("xpath=//td[text()='black']").click();

  // =========================================================
  // INTERIOR
  // =========================================================
  await orderFrame.locator('#P92_INTERIOR').click();
  await page.locator("xpath=//td[text()='green']").click();

  // =========================================================
  // SUPPLIER EVENT CODE
  // =========================================================
  await orderFrame.locator('#P92_SUPP_EVENT_CODE').fill('Test Supplier');

  // =========================================================
  // XCO NUMBER
  // =========================================================
  const xcoNumber = generateXCO();
  const xco = orderFrame.locator('#P92_XCO_NUMBER');
  await xco.fill(xcoNumber);
  console.log('XCO Number: ' + xcoNumber);

  // =========================================================
  // ENGINE TYPE
  // =========================================================
  await orderFrame.locator('#P92_ENGINE_TYPE').click();
  await page.locator("xpath=//li[text()='Turbo Diesel Engine']").click();

  // =========================================================
  // AUDIO TYPE
  // =========================================================
  await orderFrame.locator('#P92_AUDIO_TYPE').click();
  await page.locator("xpath=//li[text()='BOAT speaker']").click();

  // =========================================================
  // VENDOR SPECIFICATIONS
  // =========================================================
  await orderFrame.locator('#P92_VENDOR_SPECS').click();
  const cherryRed = page.locator("xpath=//li[@role='option' and normalize-space()='CHERRY RED']");
  await cherryRed.click();

  // =========================================================
  // DRIVE LINE
  // =========================================================
  await orderFrame.locator('#P92_DRIVE_LINE').click();
  await page.locator("xpath=//li[text()='2WD']").click();

  // =========================================================
  // SEAT TYPE
  // =========================================================
  await orderFrame.locator('#P92_SEAT_TYPE').click();
  await page.locator("xpath=//li[text()='TEST KING SEAT']").click();

  // =========================================================
  // EXTERIOR TYPE
  // =========================================================
  await orderFrame.locator('#P92_VM_EXT_TYPE_ID').click();
  await page.locator("xpath=//li[text()='TEST FLIM BLACK']").click();

  // =========================================================
  // INTERIOR TYPE
  // =========================================================
  await orderFrame.locator('#P92_VM_INT_TYPE_ID').click();
  await page.locator("xpath=//li[text()='TEST FLOOR MATE']").click();

  // =========================================================
  // PRODUCTION DATE
  // =========================================================
  await orderFrame.locator('#P92_PRODUCTION_DATE_input').click();
  const todayBtn = page.locator("xpath=//button[normalize-space()='Today']");
  await todayBtn.waitFor({ state: 'visible' });
  await todayBtn.click({ force: true });

  // =========================================================
  // REMARKS
  // =========================================================
  await orderFrame.locator('#P92_REMARKS').fill('Test Data');

  // =========================================================
  // DELIVERY DATE
  // =========================================================
  await orderFrame.locator('#P92_DELIVERY_DATE_input').click();

  const dates31 = page.locator("xpath=//td[@data-date='2026-08-31']//span[normalize-space()='31']");
  console.log('Found date elements: ' + (await dates31.count()));
  await dates31.nth(1).click();

  // =========================================================
  // UPDATE ORDER CREATION
  // =========================================================
  await orderFrame.locator('#B205189471813449717').click();
  console.log('Order creation details updated successfully');

  // =========================================================
  // SPECIFICATION
  // =========================================================
  await page.waitForTimeout(1000);

  const specificationPlus = page.locator(
    "xpath=//tr[.//td[normalize-space()='VENUE SUV']]//a[.//i[contains(@class,'fa-plus')]]"
  );
  await specificationPlus.click();

  await page.locator("xpath=//button[normalize-space()='Add Specification']").click();

  await page.waitForTimeout(1000);

  const specFrame = page.frameLocator("iframe[title='Add Specification']");
  console.log('Switched to Specification popup iframe');

  await specFrame.locator('#P93_SELECTSTANDARD').click();
  console.log('Checkbox selected');

  await specFrame.locator("xpath=//span[text()='Convert Line']").click();

  await page.waitForTimeout(1000);

  await page.locator("xpath=//span[text()='Back']").click();

  await page.waitForTimeout(1000);

  // =========================================================
  // FINALIZE
  // =========================================================
  await page.locator("xpath=//span[text()='Finalize']").click();
  console.log('Order Confirmed');

  // =========================================================
  // SEND FOR APPROVAL
  // =========================================================
  await page.waitForTimeout(1000);

  await page.locator("xpath=//span[text()='Send For Approval']").click();

  await page.waitForTimeout(1000);

  // =========================================================
  // SEND FOR APPROVAL CONFIRMATION POPUP
  // =========================================================
  const approvalPopup = page.locator(
    "xpath=//div[contains(@class,'ui-dialog') and .//button[normalize-space()='Send For Approval']]"
  );
  await approvalPopup.waitFor({ state: 'visible' });

  const confirmButton = approvalPopup.locator(
    "xpath=.//button[normalize-space()='Send For Approval']"
  );
  await confirmButton.scrollIntoViewIfNeeded();
  await confirmButton.click({ force: true });
  console.log('Order Creation sent for Approval');

  // =========================================================
  // WAIT FOR SUCCESS MESSAGE
  // =========================================================
  await waitForProcessingToClear(page);

  const successAlert = page.locator("xpath=//div[@class='t-Alert-title' and @role='alert']");
  await successAlert.waitFor({ state: 'visible' });
  console.log('Success Message: ' + (await successAlert.textContent()));

  // =========================================================
  // CLOSE SUCCESS MESSAGE
  // =========================================================
  await page.waitForTimeout(500);

  await page.locator("xpath=//span[@class='t-Icon icon-close']").click();
  console.log('Success message closed.');

  await waitForProcessingToClear(page);

  // =========================================================
  // LOGOUT DANIEL
  // =========================================================
  console.log('Starting Daniel logout process...');

  await safeClick(page, "xpath=//span[text()='Daniel Vinith G']");
  console.log('Daniel user menu clicked.');

  // =========================================================
  // SIGN OUT
  // =========================================================
  await safeClick(page, "xpath=//a[normalize-space()='Sign Out']");
  console.log('Daniel logged out successfully.');

  // =========================================================
  // WAIT FOR LOGIN PAGE
  // =========================================================
  const approverUsername = page.locator('#P9999_USERNAME');
  await approverUsername.click();
  await approverUsername.fill('Supriya');

  const approverPassword = page.locator('#P9999_PASSWORD');
  await approverPassword.click();
  await approverPassword.fill('Supriya@1234');

  await page.locator('#P9999_REMEMBER').click();
  await page.locator('#B671672845046722778').click();
  console.log('Approver logged in Successfully');

  await waitForProcessingToClear(page);

  // =========================================================
  // OPEN NEW VEHICLE SALES
  // =========================================================
  await safeClick(page, page.getByRole('link', { name: 'New Vehicle Sales', exact: true }));
  console.log('New Vehicle Sales opened.');

  // =========================================================
  // WORKFLOW DOCUMENTS
  // =========================================================
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Workflow Documents']");
  console.log('Workflow Documents opened.');

  // =========================================================
  // APPROVALS DOCUMENTS
  // =========================================================
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Approvals Documents']");
  console.log('Approvals Documents opened.');

  await waitForProcessingToClear(page);

  // =========================================================
  // FIND RECENT ORDER CREATION TASK
  // =========================================================
  // We are NOT using Transaction ID and NOT using a stored Document Number -
  // we find the first/current Order Creation row, same as the Java version.
  const orderCreationRow = page.locator(
    "xpath=(//tbody/tr[.//td[normalize-space()='Order Creation']])[1]"
  );
  await orderCreationRow.waitFor({ state: 'attached' });
  console.log('Recent Order Creation task found.');

  // =========================================================
  // GET DOCUMENT LINK FROM SAME ROW
  // =========================================================
  const orderCreationDocument = orderCreationRow.locator('xpath=.//td[1]//a');
  console.log('Order Creation document found.');

  // =========================================================
  // CLICK DOCUMENT
  // =========================================================
  await orderCreationDocument.scrollIntoViewIfNeeded();
  try {
    await orderCreationDocument.click();
  } catch (e) {
    console.log('Document click intercepted. Using forced click.');
    await orderCreationDocument.click({ force: true });
  }
  console.log('Recent Order Creation document clicked.');

  // =========================================================
  // WAIT FOR TASK DETAILS
  // =========================================================
  await waitForProcessingToClear(page);
  await safeClick(page, "xpath=//button[normalize-space()='Proceed to Approval']");

  // =========================================================
  // TASK DETAILS IFRAME
  // =========================================================
  const taskDetailsFrame = page.frameLocator("iframe[src*='task-details1']");
  console.log('Switched to Task Details iframe');

  // =========================================================
  // APPROVER COMMENT
  // =========================================================
  const commentBox = taskDetailsFrame.locator('#P246_COMMENT_TEXT');
  await commentBox.click();
  await commentBox.fill('Procced to Approved');
  console.log('Approver comment entered.');

  // =========================================================
  // APPROVE
  // =========================================================
  const approveButton = taskDetailsFrame.locator('#approve-button');
  await approveButton.scrollIntoViewIfNeeded();
  try {
    await approveButton.click();
  } catch (e) {
    console.log('Approve button click intercepted. Using forced click.');
    await approveButton.click({ force: true });
  }
  console.log('Order Creation Request has been Approved Successfully');
});