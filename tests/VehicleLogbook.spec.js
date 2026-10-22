const { test, expect } = require('@playwright/test');

// =====================================================
// TEST DATA
// =====================================================

const USERNAME = process.env.APP_USERNAME || 'Subiksha';
const PASSWORD = process.env.APP_PASSWORD || 'Subiksha@4321';

const fs = require('fs');
const path = require('path');

function getActiveCarNo() {
  if (process.env.CAR_NO) return process.env.CAR_NO;
  try {
    const activeFile = path.join(__dirname, 'active-vehicle.json');
    if (fs.existsSync(activeFile)) {
      const data = JSON.parse(fs.readFileSync(activeFile, 'utf8'));
      if (data && data.carNo) {
        console.log(`Using active vehicle from car-reg-plate: ${data.carNo}`);
        return data.carNo;
      }
    }
  } catch (e) {}
  return '4304';
}

const CAR_NO = getActiveCarNo();


// =====================================================
// HELPER - EXPAND APEX TREE NODE
// Same method used in Car Reg Replacement
// =====================================================

async function expandTreeNode(page, name) {

  let treeitem = page
    .getByRole('treeitem', { name })
    .first();

  await expect(treeitem).toBeVisible({
    timeout: 15000
  });

  const expanded = await treeitem.getAttribute(
    'aria-expanded'
  );

  // Already expanded
  if (expanded === 'true') {
    return treeitem;
  }

  // Find parent <li>
  const li = treeitem.locator(
    'xpath=ancestor::li[1]'
  );

  // Find APEX tree expand/collapse button
  const toggle = li.locator(
    '> .a-TreeView-toggle'
  );

  if (await toggle.count() > 0) {

    await toggle.click();

  } else {

    // Fallback
    await treeitem.click();

  }

  await page.waitForTimeout(1000);

  // Locate again after APEX refresh
  treeitem = page
    .getByRole('treeitem', { name })
    .first();

  await expect(treeitem).toBeVisible({
    timeout: 15000
  });

  return treeitem;
}


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

  const usernameField = page.getByRole(
    'textbox',
    { name: 'Username' }
  );

  await expect(usernameField).toBeVisible({
    timeout: 60000
  });

  await usernameField.fill(USERNAME);

  await page.getByRole(
    'textbox',
    { name: 'Password' }
  ).fill(PASSWORD);

  const signInButton = page.locator(
    '#B671672845046722778'
  );

  await expect(signInButton).toBeVisible({
    timeout: 30000
  });

  await expect(signInButton).toBeEnabled({
    timeout: 30000
  });

  // APEX login
  await signInButton.click({
    force: true
  });

  // Wait until login page disappears
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
// OPEN MAIN MENU
// =====================================================

async function openMainMenu(page) {

  // Application Launcher
  const launcher = page.locator(
    '#L201948268465196672'
  );

  await expect(launcher).toBeVisible({
    timeout: 60000
  });

  await launcher.click();

  await page.waitForTimeout(2000);

  console.log('Application Launcher opened.');

  // UCD Application
  const ucdMenu = page.getByRole(
    'menuitem',
    {
      name: 'SALESMAN UCD - Mannai Used Car'
    }
  );

  await expect(ucdMenu).toBeVisible({
    timeout: 30000
  });

  await ucdMenu.click();

  // Wait for UCD dashboard
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
// NAVIGATE TO VEHICLE MOVEMENT LOG BOOK
// =====================================================

async function navigateToVehicleMovement(page) {

  await openMainMenu(page);

  // Main Navigation
  const navigation = page.getByRole(
    'tree',
    {
      name: 'Main Navigation'
    }
  );

  await expect(navigation).toBeVisible({
    timeout: 30000
  });

  console.log('Main Navigation found.');

  // Used Car Division
  await expandTreeNode(
    page,
    'Used Car Division'
  );

  console.log('Used Car Division opened.');

  // Transactions
  await expandTreeNode(
    page,
    'Transactions'
  );

  console.log('Transactions opened.');

  // Vehicle Movement Log Book
  const vehicleMovement = page.getByRole(
    'treeitem',
    {
      name: 'Vehicle Movement Log Book'
    }
  );

  await expect(vehicleMovement).toBeVisible({
    timeout: 15000
  });

  await vehicleMovement.click();

  await page.waitForLoadState(
    'domcontentloaded'
  ).catch(() => {});

  await page.waitForTimeout(2000);

  console.log(
    'Vehicle Movement Log Book opened.'
  );
}


// =====================================================
// HELPER - SELECT VEHICLE FROM LOV POPUP
// Opens the Vehicle No LOV popup and clicks the FIRST record.
// =====================================================

async function selectVehicleFromLov(page) {

  const vehicleNo = page.locator('#P923_CAR_NO');

  await expect(vehicleNo).toBeVisible({ timeout: 15000 });

  // Click the LOV icon button to open the popup
  const lovIconButton = page.locator('#P923_CAR_NO_lov_btn');
  await expect(lovIconButton).toBeVisible({ timeout: 15000 });
  await lovIconButton.click();

  console.log('LOV popup opened. Waiting for dialog...');

  // Wait for the LOV dialog and its rows to render
  await page.waitForTimeout(2500);

  // ── Find AND click the first data row entirely inside the browser ──
  const clickResult = await page.evaluate(() => {

    // Find the visible LOV dialog
    const dialogs = Array.from(
      document.querySelectorAll('[id^="PopupLov_"][id$="_dlg"], .a-PopupLOV')
    ).filter(el => el.offsetParent !== null);

    if (dialogs.length === 0) return { success: false, reason: 'No visible dialog found' };

    const dialog = dialogs[dialogs.length - 1];

    // Get rows that have <td> cells (skip header <th> rows)
    const rows = Array.from(dialog.querySelectorAll('tr')).filter(
      row => row.querySelectorAll('td').length > 0
    );

    if (rows.length === 0) return { success: false, reason: 'No data rows in dialog' };

    // Click the first <td> of the first data row
    const firstCell = rows[0].querySelector('td');
    if (!firstCell) return { success: false, reason: 'First cell not found' };

    const cellText = (firstCell.innerText || '').replace(/\s+/g, ' ').trim();
    firstCell.click();

    return {
      success:   true,
      cellText,
      totalRows: rows.length
    };
  });

  console.log('LOV click result:', JSON.stringify(clickResult));

  if (!clickResult.success) {
    await page.screenshot({ path: 'debug-lov-no-rows.png', fullPage: true });
    throw new Error(`Vehicle LOV click failed: ${clickResult.reason}`);
  }

  console.log(`First LOV row clicked: "${clickResult.cellText}" (${clickResult.totalRows} total rows)`);

  // Confirm the Vehicle No field is now populated
  await expect(vehicleNo).not.toHaveValue('', { timeout: 15000 });

  const finalCarNo = (await vehicleNo.inputValue()).trim();
  console.log(`Vehicle selection confirmed: ${finalCarNo}`);
}



// =====================================================
// TEST
// =====================================================

test(
  'Vehicle Movement Log Book - Create and Update',
  async ({ page }) => {

    test.setTimeout(180000);

    console.log(
      '======================================'
    );

    console.log(
      'VEHICLE MOVEMENT LOG BOOK TEST'
    );

    console.log(
      '======================================'
    );


    // =================================================
    // LOGIN
    // =================================================

    await login(
      page
    );


    // =================================================
    // NAVIGATE TO VEHICLE MOVEMENT
    // =================================================

    await navigateToVehicleMovement(
      page
    );


    // =================================================
    // NEW
    // =================================================

    const newButton = page.getByRole(
      'button',
      { name: 'New' }
    );

    await expect(newButton).toBeVisible({
      timeout: 30000
    });

    await newButton.click();

    console.log('New screen opened.');


    // =================================================
    // MOVEMENT TYPE
    // =================================================

    const movementType = page.locator(
      '#P923_VEHICLE_MOVEMENT_TYPE'
    );

    await expect(movementType).toBeVisible({
      timeout: 15000
    });

    await movementType.selectOption('NT');

    console.log(
      'Movement Type selected: NT'
    );


    // =================================================
    // VEHICLE NO (LOV search + select)
    // =================================================

    await selectVehicleFromLov(
      page
    );


    // =================================================
    // PERSON NAME
    // =================================================

    const personName = page.getByRole(
      'textbox',
      {
        name: 'Person Name'
      }
    );

    await expect(personName).toBeVisible({
      timeout: 15000
    });

    await personName.fill('UCD');


    // =================================================
    // FUEL LEVEL OUT
    // =================================================

    const fuelOutRadio = page
      .getByRole(
        'radiogroup',
        {
          name: 'Fuel Level Out',
          exact: false
        }
      )
      .getByRole(
        'radio',
        {
          name: '1/2'
        }
      );

    await expect(fuelOutRadio).toBeVisible({
      timeout: 15000
    });

    await fuelOutRadio.check();

    console.log(
      'Fuel Level Out selected: 1/2'
    );


    // =================================================
    // FUEL LEVEL IN
    // =================================================

    const fuelInRadio = page
      .getByRole(
        'radiogroup',
        {
          name: 'Fuel Level In',
          exact: false
        }
      )
      .getByRole(
        'radio',
        {
          name: '1/2'
        }
      );

    await expect(fuelInRadio).toBeVisible({
      timeout: 15000
    });

    await fuelInRadio.check();

    console.log(
      'Fuel Level In selected: 1/2'
    );


    // =================================================
    // SAVE
    // =================================================

    const saveButton = page.getByRole(
      'button',
      {
        name: 'Save'
      }
    );

    await expect(saveButton).toBeVisible({
      timeout: 15000
    });

    await saveButton.click();

    // Let the APEX save round-trip (and page refresh/report
    // that follows it) settle before reading generated fields.
    await page.waitForLoadState(
      'networkidle',
      { timeout: 15000 }
    ).catch(() => {});

    console.log('Vehicle movement saved.');


    // =================================================
    // CAPTURE NRT NO
    // =================================================

    const nrtField = page.getByRole(
      'textbox',
      {
        name: 'NRT No'
      }
    );

    await expect(nrtField).toBeVisible({
      timeout: 30000
    });

    // The field appears immediately, but APEX populates its
    // value asynchronously after Save completes on the server.
    // Wait for the value itself, not just visibility.
    await expect(nrtField).not.toHaveValue('', {
      timeout: 30000
    });

    const nrtNo = (
      await nrtField.inputValue()
    ).trim();

    console.log(
      `NRT No generated: ${nrtNo}`
    );

    expect(nrtNo).not.toBe('');


    // =================================================
    // BACK
    // =================================================

    await page.getByRole(
      'button',
      {
        name: 'Back'
      }
    ).click();

    await page.waitForTimeout(2000);


    // =================================================
    // SEARCH NRT
    // =================================================

    const nrtLovButton = page.locator(
      '#P922_NRT_NO_lov_btn'
    );

    await expect(nrtLovButton).toBeVisible({
      timeout: 15000
    });

    await nrtLovButton.click();


    // =================================================
    // NRT SEARCH POPUP
    // =================================================

    const searchDialog = page.getByRole(
      'dialog',
      {
        name: 'Search'
      }
    );

    await expect(searchDialog).toBeVisible({
      timeout: 15000
    });

    const searchBox = searchDialog.getByRole(
      'textbox'
    );

    await searchBox.fill(nrtNo);

    // This popup is a list-style LOV (textbox + Search button +
    // listbox), not a data-grid LOV. Pressing Enter does not
    // trigger its filter — the dialog's own Search button does.
    const dialogSearchButton = searchDialog.getByRole(
      'button',
      {
        name: 'Search',
        exact: true
      }
    );

    await expect(dialogSearchButton).toBeVisible({
      timeout: 10000
    });

    await dialogSearchButton.click();

    // Wait for the listbox to refresh with the filtered option
    await page.waitForTimeout(1000);


    // =================================================
    // SELECT NRT
    // =================================================

    const nrtOption = searchDialog.getByRole(
      'option',
      {
        name: nrtNo,
        exact: true
      }
    );

    await expect(nrtOption).toBeVisible({
      timeout: 15000
    });

    await nrtOption.click();


    // =================================================
    // SEARCH
    // =================================================

    await page.getByRole(
      'button',
      {
        name: 'Search',
        exact: true
      }
    ).click();

    await page.waitForTimeout(2000);


    // =================================================
    // EDIT
    // =================================================

    const editLink = page.getByRole(
      'link',
      {
        name: 'Edit'
      }
    ).first();

    await expect(editLink).toBeVisible({
      timeout: 30000
    });

    await editLink.click();


    // =================================================
    // REFERENCE NO
    // =================================================

    const referenceNo = page.getByRole(
      'textbox',
      {
        name: 'Reference No'
      }
    );

    await expect(referenceNo).toBeVisible({
      timeout: 15000
    });

    const uniqueReference =
      `REF${Date.now()}`;

    await referenceNo.fill(
      uniqueReference
    );

    console.log(
      `Reference No: ${uniqueReference}`
    );


    // =================================================
    // UPDATE
    // =================================================

    const updateButton = page.getByRole(
      'button',
      {
        name: 'Update'
      }
    );

    await expect(updateButton).toBeVisible({
      timeout: 15000
    });

    await updateButton.click();

    await page.waitForTimeout(3000);

    console.log(
      'Vehicle Movement updated successfully.'
    );


    // =================================================
    // SEARCH BY SUPPLIER AND UPDATE REMARKS
    // =================================================

    console.log(
      'Searching by Supplier (venu) and updating Remarks...'
    );

    // Click Back to return to the search page (Page 922)
    const backToSearchBtn = page.getByRole(
      'button',
      { name: 'Back' }
    );

    await expect(backToSearchBtn).toBeVisible({
      timeout: 15000
    });

    await backToSearchBtn.click();

    // Wait for page navigation to complete after clicking Back
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Open Supplier LOV
    const supplierLovBtn = page.locator(
      '#P922_SUPPLIER_lov_btn'
    );

    await expect(supplierLovBtn).toBeVisible({
      timeout: 15000
    });

    await supplierLovBtn.click();

    // Supplier Search Dialog
    const supplierSearchDialog = page.getByRole(
      'dialog',
      { name: 'Search' }
    );

    await expect(supplierSearchDialog).toBeVisible({
      timeout: 15000
    });

    const supplierSearchInput = supplierSearchDialog
      .getByLabel('Search')
      .or(supplierSearchDialog.getByRole('textbox'))
      .first();

    await expect(supplierSearchInput).toBeVisible({
      timeout: 15000
    });

    await supplierSearchInput.fill('venu');
    await supplierSearchInput.press('Enter');

    // If dialog has its own Search button, click it to filter
    const dialogSearchBtn = supplierSearchDialog.getByRole(
      'button',
      { name: 'Search', exact: true }
    );

    if (await dialogSearchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dialogSearchBtn.click();
    }

    await page.waitForTimeout(1000);

    // Select the supplier option from the filtered results
    const supplierOption = supplierSearchDialog
      .getByRole('option', { name: /venu/i })
      .or(supplierSearchDialog.locator('li, [role="option"]').filter({ hasText: /venu/i }))
      .or(supplierSearchDialog.locator('tr, td').filter({ hasText: /venu/i }))
      .first();

    if (await supplierOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await supplierOption.click();
    }

    await page.waitForTimeout(1000);

    // Click Search on page 922
    const pageSearchBtn = page.getByRole(
      'button',
      { name: 'Search', exact: true }
    );

    await expect(pageSearchBtn).toBeVisible({
      timeout: 15000
    });

    await pageSearchBtn.click();

    await page.waitForTimeout(2000);

    // Click Edit on the first matching record
    const supplierEditLink = page.getByRole(
      'link',
      { name: 'Edit' }
    ).first();

    await expect(supplierEditLink).toBeVisible({
      timeout: 30000
    });

    await supplierEditLink.click();

    // Update Remarks to 'Update'
    const remarksField = page.getByRole(
      'textbox',
      { name: 'Remarks' }
    );

    await expect(remarksField).toBeVisible({
      timeout: 15000
    });

    await remarksField.click();
    await remarksField.fill('Update');

    // Click Update
    const remarksUpdateButton = page.getByRole(
      'button',
      { name: 'Update' }
    );

    await expect(remarksUpdateButton).toBeVisible({
      timeout: 15000
    });

    await remarksUpdateButton.click();

    await page.waitForTimeout(2000);

    // Click Back
    const finalBackBtn = page.getByRole(
      'button',
      { name: 'Back' }
    );

    await expect(finalBackBtn).toBeVisible({
      timeout: 15000
    });

    await finalBackBtn.click();

    // =================================================
    // DOWNLOAD REPORT AS EXCEL
    // =================================================

    await page.getByRole('button', { name: 'Actions' }).click();
    await page.locator('span').filter({ hasText: 'Download' }).click();
    await page.getByLabel('Excel').click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);

    console.log(
      'Remarks updated and navigated Back successfully.'
    );

    console.log(
      '======================================'
    );

    console.log(
      'TEST COMPLETED'
    );

    console.log(
      '======================================'
    );
  }
);