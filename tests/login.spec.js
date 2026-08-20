// // import { test, expect } from '@playwright/test';

// //  test.use({
// //    ignoreHTTPSErrors: true,
// //    browserName: 'chromium'
// //  });

// // test('Login test', async ({ page }) => {

// //   await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login ');
  

// //   await page.locator('#P9999_USERNAME').fill('Mythreyi');
// //   await page.locator('#P9999_PASSWORD').fill('Mythreyi@1234');
// //   await page.locator('#P9999_REMEMBER').click();
// //  // await page.locator('#forgot_pass').click();

// // //  await page.getByRole('button', { name: 'Sign In' }).click();

// // await page.locator('#B477263546387798872').click();

// // await page.getByRole('treeitem',{name: 'New Vehicle Sales'}).click();


// //   // Wait for UI
// //   await page.waitForTimeout(6000);

// //   // Screenshot
// //   await page.screenshot({ path: 'after-login.png', fullPage: true });

// //   // Debug frames
// //   const frames = page.frames();
// //   console.log('Total frames:', frames.length);

// // });

// import { test, expect } from '@playwright/test';

// test.use({
//   browserName: 'chromium',
//   ignoreHTTPSErrors: true
// });

// test('Switch to Mannai Used Car', async ({ page }) => {

//   // Open Mannai application
//   await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/login', {
//     waitUntil: 'networkidle'
//   });

//   // Login
//   await page.locator('#P9999_USERNAME').fill('Mythreyi');
//   await page.locator('#P9999_PASSWORD').fill('Mythreyi@1234');

//   // await page.locator('#P9999_REMEMBER').check();
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.locator('#B477263546387798872').click();

//   // Wait until dashboard is loaded
//   await page.waitForLoadState('networkidle');

//   // Click Role Switch dropdown
//   await page.locator('span.a-Button-label').click();
//   // OR (if above doesn't work)
//   // await page.locator('button[aria-haspopup="menu"]').click();

//   // Click "SALESMAN UCD - Mannai Used Car"
//   await page.getByRole('menuitem', {
//     name: /SALESMAN UCD - Mannai Used Car/i
//   }).click();

//   // Wait until page reloads
//   await page.waitForLoadState('networkidle');

//   // Verify
//   await expect(page.getByText('Mannai Used Car (UCD)')).toBeVisible();

//   // Screenshot
//   await page.screenshot({
//     path: 'Mannai-Used-Car.png',
//     fullPage: true
//   });

// });

// import { test, expect } from '@playwright/test';

// test.use({
//   ignoreHTTPSErrors: true
// });

// test('Login to Mannai Application', async ({ page }) => {

//   // Open Login Page
//   await page.goto(
//     'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
//     {
//       waitUntil: 'domcontentloaded',
//       timeout: 60000
//     }
//   );

//   // Wait for login page
//   await expect(page.locator('#P9999_USERNAME')).toBeVisible({ timeout: 30000 });

//   // Enter Username
//   await page.locator('#P9999_USERNAME').fill('Mythreyi');

//   // Enter Password
//   await page.locator('#P9999_PASSWORD').fill('Mythreyi@1234');

//   // Click Sign In
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   // Wait for dashboard to load
//   await page.waitForLoadState('networkidle');

//   // Verify dashboard loaded
//   await expect(page.locator('body')).toContainText('Mannai');

//   // Screenshot
//   await page.screenshot({
//     path: 'Login_Success.png',
//     fullPage: true
//   });

//   console.log('Login Successful');

// });

import { test, expect } from '@playwright/test';

test.use({
  browserName: 'chromium',
  ignoreHTTPSErrors: true
});

test('Create New Evaluation in Mannai UCD', async ({ page }) => {

  // Open Application
  await page.goto(
    'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  // Login
  await page.locator('#P9999_USERNAME').fill('Mythreyi');
  await page.locator('#P9999_PASSWORD').fill('Mythreyi@1234');

  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for Dashboard
  await page.waitForLoadState('networkidle');

  // Verify Dashboard
  await expect(page.locator('body')).toContainText('Mannai');

  console.log('Login Successful');

  // -------------------------------------------------------
  // Switch Role
  // -------------------------------------------------------

  // Click Switch Role icon
  await page.locator('button[title][aria-haspopup="menu"]').first().click();

  // Select UCD Role
  // await page.getByRole('menuitem', {
  //   name: /SALESMAN UCD - Mannai Used Car/i
  // }).click();

// Click the required role
await page.getByRole('menuitem', {
  name: 'SALESMAN UCD - Mannai Used Car'
}).click();
  // Wait for page load
  await page.waitForLoadState('networkidle');

  // Verify UCD Dashboard
  await expect(page.locator('body')).toContainText('Mannai Used Car');

  console.log('Role Switched Successfully');

  // -------------------------------------------------------
  // Expand Used Car Division
  // -------------------------------------------------------

  await page.locator('#t_TreeNav_0 .a-TreeView-toggle').click();

  // -------------------------------------------------------
  // Expand Transactions
  // -------------------------------------------------------
  await page.getByRole('treeitem', { name: 'Transactions' }).click();

  // await page.locator('#t_TreeNav_3 .a-TreeView-toggle').click();

  // -------------------------------------------------------
  // Click Evaluation
  // -------------------------------------------------------

  await page.getByRole('treeitem', {
    name: 'Evaluation'
  }).click();

  // Wait for Evaluation Page
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toContainText('Evaluation');

  console.log('Evaluation Page Opened');

  // -------------------------------------------------------
  // Click NEW
  // -------------------------------------------------------

  // Recommended locator
  await page.getByRole('button', { name: 'New' }).click();

  // OR
  // await page.locator('button[data-otel-label="NEW"]').click();

  await page.waitForLoadState('networkidle');

  console.log('New Button Clicked');

  // -------------------------------------------------------
  // Verify New Page Opened
  // -------------------------------------------------------

  await expect(page.locator('body')).toContainText('Evaluation');

  // Screenshot
  await page.screenshot({
    path: 'Evaluation_New_Page.png',
    fullPage: true
  });

});




