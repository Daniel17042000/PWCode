const { test, expect } = require('@playwright/test');
 
test.use({
    ignoreHTTPSErrors: true,
    launchOptions: {
   
    }
});
 
test('Oct', async ({ page }) => {
    await page.goto('https://dowellapps.com:8443/ords/r/manerp/ser131/login');
 
    await page.locator('#P9999_USERNAME').fill('Jamunaa');
    await page.locator('#P9999_PASSWORD').fill('Jamunaa@1234');
 
    await page.locator('#B784127369018699833').click();
    await page.waitForTimeout(5000);
 
   await page.locator('span.fa-random').click();
   await page.waitForTimeout(5000); // Wait for 5 seconds to allow the page to load
 
  // Wait for the service menu item to appear
 
   await page.getByRole('menuitem', {
    name: 'SERVICES - Auto Service Center'
}).click();
 
  
});
 
 
 
 
 
 
 
 
 
 
 
 
 
 
   
 
   
 
 