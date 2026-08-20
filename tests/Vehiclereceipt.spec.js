// vehicleReceipt.spec.js
// Playwright/JS conversion of MAR.Mannai.VehicleReciptRough (Selenium/Java).
//
// See requisitionDemo.spec.js for general porting notes. This file also
// ports two local helpers from the Java class:
//   - approveWorkflowDocument(taskType, approveButtonXpath)
//   - enterInvoiceNumber(cellXpath, value)  (double-click an APEX
//     Interactive Grid cell, type into its floating edit popup, then
//     commit the value by moving focus away from the cell)

const { test, expect } = require('@playwright/test');
const { waitForProcessingToClear, safeClick } = require('./utils');

test.use({
  launchOptions: {
    args: ['--disable-save-password-bubble', '--disable-notifications'],
  },
});

test('Vehicle Receipt', async ({ page }) => {
  test.setTimeout(300_000);

  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');

  // ================= LOGIN =================
  await page.locator('#P9999_USERNAME').fill('Daniel');
  await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
  await page.locator("xpath=//button[.//span[text()='Sign In']]").click();
  console.log('Login Succesfully');

  await safeClick(page, "xpath=//span[@class='t-Icon fa fa-random']");
  await safeClick(page, "xpath=//a[text()='Salesman NVS - New Vehicle Sales']");

  await waitForProcessingToClear(page);

  await safeClick(page, page.getByRole('link', { name: 'New Vehicle Sales', exact: true }));
  await safeClick(page, "xpath=//a[normalize-space()='Transactions']");
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Vehicle Receipt']");

  await safeClick(page, "xpath=//span[text()='New']");

  await safeClick(page, '#P103_SUPPLIER_SITE_ID_lov_btn');

  // ====================== SUPPLIER ======================
  const supplierPopup = page.locator('#PopupLov_103_P103_SUPPLIER_SITE_ID_dlg');
  await supplierPopup.waitFor({ state: 'visible' });
  console.log('Supplier popup opened');

  const searchBox = supplierPopup.locator('input.a-PopupLOV-search');
  await searchBox.click();
  await searchBox.fill('22042026');
  console.log('Entered supplier search: 22042026');

  await supplierPopup.locator('button.a-PopupLOV-doSearch').click();
  console.log('Supplier search executed');

  await page
    .locator('#PopupLov_103_P103_SUPPLIER_SITE_ID_dlg .a-PopupLOV-results')
    .waitFor({ state: 'visible' });

  const qarRow = page.locator(
    "xpath=//div[@id='PopupLov_103_P103_SUPPLIER_SITE_ID_dlg']//table//tbody//tr[td[normalize-space()='QAR']]"
  );
  await qarRow.waitFor({ state: 'visible' });
  console.log('QAR row found');

  await qarRow.click();
  console.log('QAR supplier selected successfully');

  await safeClick(page, '#P103_SHP_ID_lov_btn');

  const firstShipment = page.locator("xpath=(//tbody/tr[@data-rownum='1'])[2]");
  await firstShipment.waitFor({ state: 'attached' });
  console.log('First shipment record found');
  await firstShipment.click();

  await safeClick(page, '#P103_AGENCY_FLAG');
  await safeClick(page, "xpath=//li[text()='Yes']");

  await safeClick(page, '#P103_PARK_LOC_ID');
  await safeClick(page, "xpath=//td[text()='Test Parking Location']");

  await safeClick(page, '#P103_TRADE_TERM_ID');
  await safeClick(page, "xpath=//td[text()='DAS']");

  const remark = page.locator('#P103_REMARKS');
  await remark.fill('Vehicle Recipt Header');

  await safeClick(page, "xpath=//span[text()='Save']");
  console.log('Header create Successfully');

  await waitForProcessingToClear(page);

  await safeClick(page, "xpath=//span[text()='Pickorder']");

  await waitForProcessingToClear(page);

  const firstCheckbox = page.locator("xpath=(//tbody/tr[1]//input[@type='checkbox'])[1]");
  await firstCheckbox.waitFor({ state: 'attached' });
  await firstCheckbox.click();
  console.log('First checkbox selected');

  await safeClick(page, '#B648721716271428854');

  const freightAmount = page.locator('#P103_FREIGHT_AMT');
  await freightAmount.fill('1000');

  const cio = page.locator('#P103_CIO');
  await cio.fill('3');

  await safeClick(page, "xpath=//span[text()='Copy']");
  console.log('Fright Amount and CIO% copied Successfully');

  await safeClick(page, "xpath=//span[text()='Send For Approval']");

  await waitForProcessingToClear(page);

  const successText = await page
    .locator("xpath=//h2[@id='page_success_id']/following::div")
    .first()
    .textContent();
  const number1 = successText.replace(/\D+/g, '');
  console.log('Generated Document No: ' + number1);

  // ======== VEHICLE RECEIPT WORKFLOW =================
  await safeClick(page, "xpath=//span[@class='t-Icon icon-close']");

  await safeClick(page, "xpath=//span[text()='Daniel Vinith G']");
  await safeClick(page, "xpath=//a[normalize-space()='Sign Out']");
  console.log('Login page displayed');

  const approverUsername = page.locator('#P9999_USERNAME');
  await approverUsername.click();
  await approverUsername.fill('Supriya');

  await page.locator('#P9999_PASSWORD').fill('Supriya@1234');
  await page.locator('#P9999_REMEMBER').click();
  await safeClick(page, '#B671672845046722778');
  console.log('Approver loged in Successfully');

  await waitForProcessingToClear(page);

  // ================= WORKFLOW: OPEN APPROVALS DOCUMENT (VEHICLE RECEIPT) =================
  await safeClick(page, page.getByRole('link', { name: 'New Vehicle Sales', exact: true }));
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Workflow Documents']");
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Approvals Documents']");

  await waitForProcessingToClear(page);

  await approveWorkflowDocument(
    page,
    'Vehicle Receipt',
    "xpath=//*[@id='R1255531882050966715']/div[2]/div[2]/button"
  );

  let taskDetailsFrame = page.frameLocator("iframe[src*='task-details1']");
  const commentBox = taskDetailsFrame.locator('#P246_COMMENT_TEXT');
  await commentBox.click();
  await commentBox.fill('Procced to Approved');

  await safeClick(page, taskDetailsFrame.locator('#approve-button'));
  console.log('Request has been Approved');

  // =========================================================
  // SUPRIYA LOGOUT
  // =========================================================
  await safeClick(page, "xpath=//span[text()='Supriya']");
  await safeClick(page, "xpath=//a[normalize-space()='Sign Out']");
  console.log('Supriya logged out successfully');

  // =========================================================
  // DANIEL LOGIN AGAIN
  // =========================================================
  const loginUsername = page.locator('#P9999_USERNAME');
  await loginUsername.click();
  await loginUsername.fill('Daniel');

  await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
  await page.locator('#P9999_REMEMBER').click();
  await safeClick(page, '#B671672845046722778');
  console.log('Daniel logged in Successfully');

  await waitForProcessingToClear(page);

  // =========================================================
  // DANIEL - VEHICLE RECEIPT
  // =========================================================
  await safeClick(page, "xpath=//span[@class='t-Icon fa fa-random']");
  await safeClick(page, "xpath=//a[text()='Salesman NVS - New Vehicle Sales']");

  await waitForProcessingToClear(page);

  await safeClick(page, page.getByRole('link', { name: 'New Vehicle Sales', exact: true }));
  await safeClick(page, "xpath=//a[normalize-space()='Transactions']");
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Vehicle Receipt']");

  // =========================================================
  // FIRST RECORD
  // =========================================================
  const firstEyeRecord = page.locator(
    "xpath=(//tbody/tr[.//i[contains(@class,'fa-eye')]])[1]//a[.//i[contains(@class,'fa-eye')]]"
  );
  await firstEyeRecord.click();
  console.log('First eye record clicked successfully');

  // =========================================================
  // CLICK MATCHING
  // =========================================================
  await page.locator("xpath=//span[normalize-space()='Matching']").click();
  console.log('Matching clicked successfully');

  // =========================================================
  // ENTER INVOICE NUMBER (double-click grid cell to edit)
  // =========================================================
  const invoiceCellXpath = "xpath=//*[@id='MY_IG_ig_grid_vc']/div[2]/div[3]/table/tbody/tr/td[6]";
  await enterInvoiceNumber(page, invoiceCellXpath, '11234');

  // =========================================================
  // SAVE
  // =========================================================
  await safeClick(page, "xpath=//span[normalize-space()='Save']");
  console.log('Invoice number saved successfully');

  // =========================================================
  // BACK
  // =========================================================
  await safeClick(page, "xpath=//span[text()='Back']");

  // =========================================================
  // AUTHORIZE
  // =========================================================
  await safeClick(page, "xpath=//span[text()='Authorize']");

  // =========================================================
  // TRANSACTION ID
  // =========================================================
  const alertTitle = page.locator("xpath=//div[@class='t-Alert-title' and @role='alert']");
  await alertTitle.waitFor({ state: 'visible' });
  const text1 = await alertTitle.textContent();
  const transactionId = text1.replace(/.*Transaction ID\s*:\s*(\d+).*/, '$1');
  console.log('Generated Transaction ID: ' + transactionId);

  // =========================================================
  // DANIEL LOGOUT
  // =========================================================
  await safeClick(page, "xpath=//span[text()='Daniel Vinith G']");
  await safeClick(page, "xpath=//a[normalize-space()='Sign Out']");
  console.log('Daniel logged out successfully');

  // =========================================================
  // SUPRIYA LOGIN AGAIN
  // =========================================================
  await waitForProcessingToClear(page);

  const approverUsername2 = page.locator('#P9999_USERNAME');
  await approverUsername2.click();
  await approverUsername2.fill('Supriya');

  await page.locator('#P9999_PASSWORD').fill('Supriya@1234');
  await page.locator('#P9999_REMEMBER').click();
  await safeClick(page, '#B671672845046722778');
  console.log('Supriya logged in Successfully');

  await waitForProcessingToClear(page);

  // =========================================================
  // SUPRIYA - WORKFLOW DOCUMENT (PURCHASE INVOICE)
  // =========================================================
  await safeClick(page, page.getByRole('link', { name: 'New Vehicle Sales', exact: true }));
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Workflow Documents']");
  await safeClick(page, "xpath=//a[@role='treeitem' and normalize-space()='Approvals Documents']");

  await waitForProcessingToClear(page);

  await approveWorkflowDocument(
    page,
    'Purchase Invoice',
    "xpath=//button[contains(@class,'t-Button--hot') and normalize-space()='Proceed to Approval']"
  );

  // =========================================================
  // TASK DETAILS IFRAME
  // =========================================================
  taskDetailsFrame = page.frameLocator("iframe[src*='task-details1']");

  // =========================================================
  // COMMENT
  // =========================================================
  const commentBox2 = taskDetailsFrame.locator('#P246_COMMENT_TEXT');
  await commentBox2.click();
  await commentBox2.fill('Procced to Approved');

  // =========================================================
  // FINAL APPROVE
  // =========================================================
  await safeClick(page, taskDetailsFrame.locator('#approve-button'));
  console.log('Final Request has been Approved');

  await waitForProcessingToClear(page);

  // =========================================================
  // FINAL SUCCESS NOTIFICATION
  // =========================================================
  try {
    const finalSuccess = page.locator('#t_Alert_Success');
    await finalSuccess.waitFor({ state: 'visible', timeout: 5000 });

    console.log(
      'Final Notification: ' + (await finalSuccess.locator('.t-Alert-title').textContent())
    );

    await safeClick(page, '#t_Alert_Success .t-Alert-close');

    await finalSuccess.waitFor({ state: 'hidden' });
    console.log('Final success notification closed.');
  } catch (e) {
    console.log('Final success notification not displayed.');
  }

  console.log('Vehicle Receipt automation completed successfully.');
});

// =============================================================
// REUSABLE: FIND MOST RECENT APPROVAL ROW BY TASK TYPE, CLICK ITS
// DOCUMENT NUMBER, THEN TRIGGER THE APPROVAL ACTION FOR THAT PAGE
// =============================================================
async function approveWorkflowDocument(page, taskType, approveButtonXpath) {
  const targetRow = page.locator(
    `xpath=(//tbody/tr[.//td[normalize-space()='${taskType}']])[1]`
  );
  await targetRow.waitFor({ state: 'attached' });
  console.log(taskType + ' row found.');

  const documentNumber = targetRow.locator('xpath=.//td[1]//a');
  const docNo = await documentNumber.textContent();
  console.log('Latest ' + taskType + ' Document No: ' + docNo);

  await documentNumber.click();

  await safeClick(page, approveButtonXpath);
  console.log('Proceed to Approval clicked for ' + taskType + ' document: ' + docNo);
}

// =============================================================
// REUSABLE: DOUBLE-CLICK AN INTERACTIVE GRID CELL TO ENTER EDIT MODE,
// THEN TYPE INTO THE CELL'S EDITABLE INPUT, RETRYING THE DOUBLE-CLICK
// IF THE EDIT POPUP DOESN'T APPEAR THE FIRST TIME.
// =============================================================
// The edit control is NOT a child of the <td>. APEX renders it as a
// floating popup elsewhere in the DOM, and the active cell only points to
// it via an aria-owns attribute, e.g.
//   <td class="a-GV-cell u-tC is-active" aria-owns="MY_IG_ig_grid_vc_floatingItem_dialog">
// So after double-clicking we wait for the cell to gain "is-active", read
// its aria-owns attribute to get the floating popup's id, then find the
// <input> inside that popup and type into it - mirroring the Java version's
// fallback-to-"*floatingItem_dialog*" logic when aria-owns is missing.
async function enterInvoiceNumber(page, cellXpath, value) {
  const cellLocator = page.locator(cellXpath);
  const activeCellLocator = page.locator(`${cellXpath}[contains(@class,'is-active')]`);

  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await cellLocator.waitFor({ state: 'visible', timeout: 15000 });
      await cellLocator.scrollIntoViewIfNeeded();

      // Double-click to switch the cell into edit mode.
      await cellLocator.dblclick();

      try {
        await activeCellLocator.waitFor({ state: 'attached', timeout: 3000 });

        const dialogId = await activeCellLocator.getAttribute('aria-owns');

        const inputLocator = dialogId
          ? page.locator(`xpath=//*[@id='${dialogId}']//input`)
          : page.locator("xpath=//*[contains(@id,'floatingItem_dialog')]//input");

        await inputLocator.waitFor({ state: 'visible', timeout: 3000 });
        await inputLocator.click();

        // .clear()/.fill() can be unreliable on this custom edit control, so
        // select-all + delete before typing the new value, same as the Java
        // version.
        await inputLocator.press('Control+A');
        await inputLocator.press('Delete');
        await inputLocator.type(value);

        // Typing into the cell only changes it visually - the Interactive
        // Grid doesn't mark the cell "dirty" / commit the new value until
        // focus actually leaves it (Tab, Enter, or a click elsewhere).
        await inputLocator.press('Tab');

        // Some IG configurations need an explicit click outside the cell
        // rather than just a Tab, so also click a neutral spot in the grid
        // (its header row) to force the blur/commit, best-effort.
        try {
          await page.locator("xpath=//*[@id='MY_IG_ig_grid_vc']//thead//th[1]").click({ force: true });
        } catch (ignoreHeaderClick) {
          // Header cell not found - the Tab above should already have
          // committed the value, so this fallback click is best-effort.
        }

        await waitForProcessingToClear(page);

        console.log(
          `Invoice number entered and committed: ${value} (double-click attempt ${attempt})`
        );
        return;
      } catch (innerTimeout) {
        console.log(`Edit popup did not appear on attempt ${attempt}. Retrying double-click...`);
      }
    } catch (staleOrTimeout) {
      lastError = staleOrTimeout;
      console.log(`Cell interaction failed on attempt ${attempt}. Retrying...`);
    }
  }

  throw new Error(
    `Failed to enter invoice number after ${maxAttempts} double-click attempts on cell: ${cellXpath} (${lastError})`
  );
}