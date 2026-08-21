import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('Daniel');
  await page.getByRole('textbox', { name: 'Username' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Username' }).press('ControlOrMeta+c');
  await page.locator('.t-Form-inputContainer').first().click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Daniel@1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.locator('#L329651249755001485').click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.locator('span').filter({ hasText: 'Salesman NVS - New Vehicle' }).click();
  await page.getByRole('treeitem', { name: ' New Vehicle Sales' }).click();
  await page.locator('div').filter({ hasText: /^New Vehicle Sales$/ }).first().click();
  await page.getByRole('treeitem', { name: 'Masters' }).click();
  await page.locator('#t_TreeNav_2_subtree div').filter({ hasText: 'Make' }).click();
  await page.getByRole('button', { name: 'New' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().locator('#P4_SUPPLIER_ID_lov_btn').click();
  await page.getByRole('dialog', { name: 'Search' }).getByRole('textbox').fill('venu');
  await page.getByRole('dialog', { name: 'Search' }).getByRole('textbox').press('Enter');
  await page.getByRole('rowheader', { name: 'Venue Corporation and co' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Make Code' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Make Code' }).fill('1000');
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Make Name' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Make Name' }).fill('4fee');
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Release Year' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Release Year' }).fill('2026');
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Description' }).click();
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('textbox', { name: 'Description' }).fill('Test');
  await page.locator('iframe[title="Make"]').contentFrame().getByRole('button', { name: 'Save' }).click();
}); 