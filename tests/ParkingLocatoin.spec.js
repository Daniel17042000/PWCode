import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');
  await page.getByRole('textbox', { name: 'Username' }).fill('Daniel');
  await page.getByRole('textbox', { name: 'Username' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Username' }).press('ControlOrMeta+c');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Daniel@1234');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.locator('#L430358693114837525').click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('menuitem', { name: 'Salesman NVS - New Vehicle' }).click();
  await page.locator('.a-TreeView-toggle').first().click();
  await page.locator('#t_TreeNav_2 > .a-TreeView-toggle').click();
  await page.getByRole('treeitem', { name: 'Parking Location' }).click();
  await page.getByRole('combobox', { name: 'Name', exact: true }).click();
  await page.getByRole('rowheader', { name: 'Test Parking Location' }).click();
  await page.getByLabel('Location Master', { exact: true }).getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('gridcell', { name: 'TPL' }).click();
  await page.getByLabel('Parking Slots').getByRole('button', { name: 'New' }).click();n
  await page.locator('iframe[title="Parking Slot"]').contentFrame().getByRole('textbox', { name: 'Park Short Name' }).click();
  await page.locator('iframe[title="Parking Slot"]').contentFrame().getByRole('textbox', { name: 'Park Short Name' }).fill('Test');
  await page.locator('iframe[title="Parking Slot"]').contentFrame().getByRole('button', { name: 'Save' }).click();
  await page.getByRole('gridcell', { name: 'TPL' }).click();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.locator('iframe[title="Parking Slot"]').contentFrame().getByRole('button', { name: 'Update' }).click();
  await page.getByRole('gridcell', { name: 'TPL' }).click();
  await page.locator('td:nth-child(14) > a').click();
  await page.getByRole('dialog').locator('div').filter({ hasText: /^Record Info$/ }).click();
  await page.getByRole('dialog', { name: 'Record Info' }).getByLabel('Close').click();
});