import {test,expect} from '@playwright/test';

test('test', async ({ page }) => {
   
   await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login');

    await page.getByPlaceholder('Username').fill("Daniel");
    await page.getByPlaceholder('Password').fill("Daniel@1234");
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.locator('#L430358693114837525').click();
 
 
  await page.getByRole('menuitem', { name: 'Salesman NVS - New Vehicle' }).click();
  await page.locator('.a-TreeView-toggle').first().click();
  await page.locator('#t_TreeNav_6 > .a-TreeView-toggle').click();
  await page.getByRole('treeitem', { name: 'Credit Control Approval' }).click();
  await page.getByRole('link', { name: 'Edit' }).nth(1).click();
  await page.getByRole('button', { name: 'Create Loan' }).click();
  await page.locator('#P159_LOAN_SCH_ID_lov_btn').click();
  await page.getByRole('gridcell', { name: 'EDP - ( Half Yearly ) 3 years' }).click();
  await page.getByRole('textbox', { name: 'Security Cheque No' }).click();
  await page.getByRole('textbox', { name: 'Security Cheque No' }).fill('test');
  await page.getByRole('textbox', { name: 'Security Name' }).click();
  await page.getByRole('textbox', { name: 'Security Name' }).fill('Test');
  await page.locator('#P159_SECU_CHQ_BANK_lov_btn').click();
  await page.getByRole('option', { name: '-100-00 (0% DP - 100% EMI) - 3 years' }).click();
  await page.getByRole('region', { name: 'Form2' }).getByLabel('Select Date').click();
  await page.getByRole('button', { name: 'Today' }).click();
  await page.getByRole('textbox', { name: 'Guarantee Cheque No' }).click();
  await page.getByRole('textbox', { name: 'Guarantee Cheque No' }).fill('Test');
  await page.getByRole('textbox', { name: 'Guarantee Name' }).click();
  await page.getByRole('textbox', { name: 'Guarantee Name' }).fill('Test');
  await page.locator('#P159_GUAR_CHQ_BANK_1_lov_btn').click();
  await page.getByRole('option', { name: '!!!!!!11111AAAAA' }).click();
  await page.getByRole('region', { name: 'Form3' }).getByLabel('Select Date').click();
  await page.getByRole('button', { name: 'Today' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Calculate' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
});