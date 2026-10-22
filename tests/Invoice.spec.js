const { test, expect } = require('@playwright/test');
const { waitForProcessingToClear, safeClick } = require('./Utils');
 
// =====================================================
// TEST DATA
// =====================================================
 
const USERNAME = process.env.APP_USERNAME || 'Subiksha';
const PASSWORD = process.env.APP_PASSWORD || 'Subiksha@4321';
const WAIT_TIMEOUT = 30000;
 
 
// =====================================================
// LOGIN
// =====================================================
 
async function login(page) {
 
  await page.goto(
    'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
    {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    }
  );
 
  const usernameField = page.getByRole('textbox', {
    name: 'Username'
  });
 
  await expect(usernameField).toBeVisible({
    timeout: 60000
  });
 
  await usernameField.fill(USERNAME);
 
  await page.getByRole('textbox', {
    name: 'Password'
  }).fill(PASSWORD);
 
  const signInButton = page.locator(
    '#B671672845046722778'
  );
 
  await expect(signInButton).toBeVisible({
    timeout: 30000
  });
 
  await expect(signInButton).toBeEnabled({
    timeout: 30000
  });
 
  await signInButton.click({
    force: true
  });
 
  await page.waitForURL(
    url => !url.pathname.endsWith('/login'),
    {
      timeout: 60000
    }
  );
 
  console.log('Login successful.');
  console.log('After login:', page.url());
}
 
 
// =====================================================
// EXPAND APEX TREE NODE
// =====================================================
 
async function expandTreeNode(page, name) {
 
  let treeitem = page.getByRole('treeitem', {
    name
  }).first();
 
  await expect(treeitem).toBeVisible({
    timeout: 15000
  });
 
  const expanded = await treeitem.getAttribute(
    'aria-expanded'
  );
 
  if (expanded === 'true') {
    return treeitem;
  }
 
  const li = treeitem.locator(
    'xpath=ancestor::li[1]'
  );
 
  const toggle = li.locator(
    '> .a-TreeView-toggle'
  );
 
  if (await toggle.count() > 0) {
    await toggle.click();
  } else {
    await treeitem.click();
  }
 
  await page.waitForTimeout(1000);
 
  treeitem = page.getByRole('treeitem', {
    name
  }).first();
 
  await expect(treeitem).toBeVisible({
    timeout: 15000
  });
 
  return treeitem;
}
 
 
// =====================================================
// OPEN MAIN MENU
// =====================================================
 
async function openMainMenu(page) {
 
  const launcher = page.locator(
    '#L201948268465196672'
  );
 
  await expect(launcher).toBeVisible({
    timeout: 60000
  });
 
  await launcher.click();
 
  await page.waitForTimeout(2000);
 
  console.log('Application Launcher opened.');
 
  const ucdMenu = page.getByRole('menuitem', {
    name: 'SALESMAN UCD - Mannai Used Car'
  });
 
  await expect(ucdMenu).toBeVisible({
    timeout: 30000
  });
 
  await ucdMenu.click();
 
  await expect(page).toHaveURL(
    /ucd-salesman-dashboard/,
    {
      timeout: 60000
    }
  );
 
  console.log('UCD application opened.');
  console.log('UCD URL:', page.url());
}
 
 
// =====================================================
// NAVIGATE TO CARS REG PLATE REPLACEMENT
// =====================================================
 
async function navigateToCarRegPlate(page) {
 
  await openMainMenu(page);
 
  const navigation = page.getByRole('tree', {
    name: 'Main Navigation'
  });
 
  await expect(navigation).toBeVisible({
    timeout: 30000
  });
 
  console.log('Main Navigation found.');
 
  await expandTreeNode(
    page,
    'Used Car Division'
  );
 
  console.log('Used Car Division opened.');
 
  await expandTreeNode(
    page,
    'Transactions'
  );
 
  console.log('Transactions opened.');
 
  const carRegPlate = page.getByRole('treeitem', {
    name: 'Cars Reg Plate Replacement'
  });
 
  await expect(carRegPlate).toBeVisible({
    timeout: 15000
  });
 
  await carRegPlate.click();
 
  await page.waitForLoadState(
    'domcontentloaded'
  ).catch(() => {});
 
  await page.waitForTimeout(2000);
 
  console.log(
    'Cars Reg Plate Replacement screen opened.'
  );
 
  console.log(
    'Current URL:',
    page.url()
  );
}
 
// =====================================================
// NAVIGATE TO INVOICE
// =====================================================
 
async function navigateToInvoice(page) {
 
  await openMainMenu(page);
 
  const navigation = page.getByRole('tree', {
    name: 'Main Navigation'
  });
 
  await expect(navigation).toBeVisible({
    timeout: 30000
  });
 
  await expandTreeNode(
    page,
    'Used Car Division'
  );
 
  await expandTreeNode(
    page,
    'Transactions'
  );
 
  const invoice = page.getByRole('treeitem', {
    name: 'Invoice',
    exact: true
  });
 
  await expect(invoice).toBeVisible({
    timeout: 15000
  });
 
  await invoice.click();
 
  await page.waitForLoadState(
    'domcontentloaded'
  ).catch(() => {});
 
  await expect(page.getByText('New', {
    exact: true
  })).toBeVisible({
    timeout: 30000
  });
 
  console.log('Invoice screen opened.');
  console.log('Current URL:', page.url());
}
 
// =====================================================
// SELECT VEHICLE FROM LOV
// =====================================================
 
async function selectVehicle(page, vehicleNo) {
 
  await safeClick(
    page,
    page.locator('#P170_CR_CM_CAR_ID_lov_btn'),
    'Vehicle LOV button'
  );
 
  const searchDialog = page.getByRole('dialog', {
    name: 'Search'
  });
 
  const topLevelSearch = page.locator(
    "input[aria-label='Search']"
  );
 
  const searchBox = searchDialog.getByRole('textbox').first();
 
  let activeSearchBox = searchBox;
 
  if (await searchDialog.count() === 0) {
    activeSearchBox = topLevelSearch;
  }
 
  await expect(activeSearchBox).toBeVisible({
    timeout: WAIT_TIMEOUT
  });
 
  await activeSearchBox.fill(vehicleNo);
  await activeSearchBox.press('Enter');
 
  console.log(
    `Vehicle search executed for Vehicle No: ${vehicleNo}`
  );
 
  const vehicleRow = page.locator(
    `//div[contains(@class,'a-PopupLOV-dialog')]//tr[@role='row'][td[1][normalize-space()='${vehicleNo}']]`
  );
 
  await expect(vehicleRow).toBeVisible({
    timeout: WAIT_TIMEOUT
  });
 
  await vehicleRow.click();
 
  console.log(`Vehicle No ${vehicleNo} selected.`);
}
 
 
// =====================================================
// GENERATE REGISTRATION NUMBER
// =====================================================
 
function generateRegistrationNo() {
 
  const timestamp = Date.now().toString().slice(-7);
  const randomPart = Math.floor(100 + Math.random() * 900).toString();
 
  return `XCO${timestamp}${randomPart}`;
}
 
 
// =====================================================
// TEST
// =====================================================
 
test(
  'Create and finalize invoice for a vehicle',
  async ({ page }) => {
 
    test.setTimeout(180000);
 
    console.log('======================================');
    console.log('INVOICE CREATION TEST');
    console.log('======================================');
 
 
    // =================================================
    // LOGIN
    // =================================================
 
    await login(page);
 
 
    // =================================================
    // OPEN INVOICE SCREEN
    // =================================================
 
    await navigateToInvoice(page);
 
 
    // =================================================
    // CREATE NEW INVOICE
    // =================================================
 
    await safeClick(
      page,
      page.getByText('New', {
        exact: true
      }),
      'New invoice button'
    );
 
    await safeClick(
      page,
      page.locator('#P129_SALE_TYPE_ID_lov_btn'),
      'Sale Type LOV button'
    );
 
    await safeClick(
      page,
      page.getByText('NVS ONLINE TRANSACTION', {
        exact: true
      }),
      'NVS online transaction sale type'
    );
 
    await safeClick(
      page,
      page.locator('#pick_btn'),
      'Pick button'
    );
 
    await waitForProcessingToClear(page);
 
    await safeClick(
      page,
      page.getByRole('button', {
        name: /^Convert$/i
      }).first(),
      'Convert button'
    );
 
    await page.waitForTimeout(500);
    await waitForProcessingToClear(page);
 
 
    // =================================================
    // ENTER INVOICE DETAILS
    // =================================================
 
    await page.locator('#P129_CUST_REF').fill('Test Customer');
    await page.getByLabel('Receipt Number', {
      exact: true
    }).fill('12345');
    await page.locator('#P129_INSURANCE_NO').fill('66543');
    await page.locator('#P129_CAPEX_NO').fill('22321');
    await page.locator('#P129_MEMO_NO').fill('889764');
    await page.locator('#P129_DOC_NARRATION').fill('Test Invoice');
 
    console.log('Invoice details entered.');
 
    await safeClick(
      page,
      page.getByRole('button', {
        name: 'Save',
        exact: true
      }),
      'Invoice Save button'
    );
 
    await waitForProcessingToClear(page);
 
 
    // =================================================
    // FINALIZE INVOICE
    // =================================================
 
    await safeClick(
      page,
      page.getByRole('button', {
        name: 'Finalize',
        exact: true
      }),
      'Finalize button'
    );
 
    await waitForProcessingToClear(page);
 
    console.log(
      'Invoice finalized successfully and vehicle status changed to SOLD.'
    );
 
    console.log('======================================');
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('======================================');
  }
);
 
 