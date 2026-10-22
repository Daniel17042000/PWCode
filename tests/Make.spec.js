import { test, expect } from '@playwright/test';
import path from 'path';

// ============================================================
// APEX PROCESSING WAIT
// ============================================================
async function waitForProcessingToClear(page) {
  const processing = page.locator(
    '.u-Processing, .u-Processing-spinner, .apex_wait_overlay'
  );

  try {
    await processing.first().waitFor({
      state: 'hidden',
      timeout: 15000
    });
  } catch {
    // Processing indicator may not be displayed.
  }
}

test('Make screen - Search Make, Edit, and Upload File', async ({ page }) => {
  test.setTimeout(120000);

  // Auto-accept confirmation dialogs (required for role switching)
  page.on('dialog', async dialog => {
    console.log(`Dialog (${dialog.type()}): "${dialog.message()}"`);
    await dialog.accept();
  });

  // 1. Login
  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login', {
    waitUntil: 'domcontentloaded'
  });

  await page.getByRole('textbox', { name: 'Username' }).fill('Daniel');
  await page.getByRole('textbox', { name: 'Password' }).fill('Daniel@1234');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await waitForProcessingToClear(page);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 2. Switch Role to Salesman NVS
  const roleSwitchBtn = page.locator('span.t-Icon.fa.fa-random, .t-Icon.fa-random').first();
  await roleSwitchBtn.waitFor({ state: 'visible', timeout: 20000 });
  await roleSwitchBtn.click();

  const salesmanNvsOption = page.getByRole('menuitem', { name: /Salesman NVS - New Vehicle/i })
    .or(page.locator("xpath=//a[contains(., 'Salesman NVS - New Vehicle')]")).first();
  await salesmanNvsOption.waitFor({ state: 'visible', timeout: 20000 });
  await salesmanNvsOption.click();

  await waitForProcessingToClear(page);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 3. Navigate: Expand New Vehicle Sales -> Masters -> Make
  const nvsToggle = page.locator('#t_TreeNav_0 .a-TreeView-toggle, .a-TreeView-node:has-text("New Vehicle Sales") .a-TreeView-toggle').first();
  if (await nvsToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nvsToggle.click();
  } else {
    await page.getByRole('treeitem', { name: /New Vehicle Sales/ }).click();
  }
  await page.waitForTimeout(1000);

  await page.getByRole('treeitem', { name: 'Masters' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('treeitem', { name: 'Make' }).click();
  await waitForProcessingToClear(page);
  await page.waitForTimeout(1500);

  // 4. Search Supplier LOV
  await page.locator('#P2_SUPPLIER_lov_btn').click();
  const searchInput = page.getByRole('dialog', { name: 'Search' }).getByRole('textbox').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15000 });
  await searchInput.fill('venu');
  await searchInput.press('Enter');

  const supplierRow = page.getByRole('rowheader', { name: /Venue Corporation and co/i })
    .or(page.locator('td, th', { hasText: /Venue Corporation and co/i })).first();
  await supplierRow.waitFor({ state: 'visible', timeout: 15000 });
  await supplierRow.click();

  // 5. Search & Edit Make Record
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await waitForProcessingToClear(page);
  await page.waitForTimeout(1500);

  const editLink = page.getByRole('link', { name: 'Edit' }).first();
  await editLink.waitFor({ state: 'visible', timeout: 15000 });
  await editLink.click();

  // 6. Inside Make Iframe - Click "Upload File"
  const makeFrame = page.frameLocator('iframe[title="Make"]');
  const uploadFileBtn = makeFrame.getByRole('button', { name: 'Upload File' });
  await uploadFileBtn.waitFor({ state: 'visible', timeout: 20000 });
  await uploadFileBtn.click();

  await waitForProcessingToClear(page);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // 7. Choose File
  console.log('Selecting file from file manager...');
  const imagePath = 'C:\\Users\\Daniel Vinith\\OneDrive\\Pictures\\Camera Roll\\2_17.jpg';

  const chooseFileButton = page.locator(
    '#P1077_FILE_BROWSE_input, input[type="file"], input.apex-item-file'
  ).first();

  await chooseFileButton.waitFor({
    state: 'attached',
    timeout: 15000
  });

  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
  await chooseFileButton.click({ force: true });
  const fileChooser = await fileChooserPromise;

  if (fileChooser) {
    await fileChooser.setFiles(imagePath);
  } else {
    await chooseFileButton.setInputFiles(imagePath);
  }

  console.log('✅ File selected and opened from file manager:', imagePath);
  await waitForProcessingToClear(page);
  await page.waitForTimeout(1500);

  // 8. Select Image Type
  console.log('Selecting Image Type...');
  const imageTypeLov = page.locator('#P1077_IMG_TYPE_lov_btn');

  await imageTypeLov.waitFor({
    state: 'visible',
    timeout: 15000
  });

  await imageTypeLov.click();

  const vehicleImagesOption = page.getByRole('rowheader', {
    name: 'Vehicle Images'
  });

  await vehicleImagesOption.waitFor({
    state: 'visible',
    timeout: 15000
  });

  await vehicleImagesOption.click();

  // Confirm Image Type is set
  const imageTypeInput = page.locator('#P1077_IMG_TYPE');
  await expect(imageTypeInput).not.toHaveValue('', { timeout: 10000 });
  console.log('✅ Image Type set:', await imageTypeInput.inputValue());

  // 9. Add Attachment
  console.log('Adding attachment...');
  const addButton = page.getByRole('button', { name: 'Add' });

  await addButton.waitFor({
    state: 'visible',
    timeout: 15000
  });

  await expect(addButton).toBeEnabled({ timeout: 10000 });
  await addButton.click();

  await waitForProcessingToClear(page);
  await page.waitForTimeout(1000);
  console.log('✅ Attachment added');

  // 10. Back
  console.log('Going back...');
  const backButton = page.getByRole('button', { name: 'Back' });
  await backButton.waitFor({
    state: 'visible',
    timeout: 15000
  });
  await backButton.click();

  await waitForProcessingToClear(page);
  await page.waitForTimeout(1500);

  const frameBackBtn = makeFrame.getByRole('button', { name: 'Back' });
  if (await frameBackBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await frameBackBtn.click();
  }

  console.log('Make record edit and file upload completed successfully.');
});