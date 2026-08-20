import { test, expect } from '@playwright/test';

test.use({
    ignoreHTTPSErrors: true,
    browserName: 'chromium'
});

test('Mannai test', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('https://dowellapps.com:8443/ords/r/manerp/aut129129/home?session=7896835757783');
    await page.locator('#P9999_USERNAME').fill('Daniel');
    await page.locator('#P9999_PASSWORD').fill('Daniel@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');

    // Navigate to Requisition
    await page.locator('#t_TreeNav_0').click();
    await page.waitForTimeout(1000);
    await page.getByRole('treeitem', { name: 'Transactions' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('treeitem', { name: 'Purchases' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('treeitem', { name: 'Requisition' }).click();

    // Click New/Add button
    await page.locator('#BTNS_onlyicon').click();


    // Select Salesman
    await page.locator('#P82_SALESMAN_ID_lov_btn').click();
    await page.waitForTimeout(1000);

    await page.locator('input.a-PopupLOV-search').fill('22042026');
    await page.waitForTimeout(1000);
    await page.locator('button[aria-label="Search"]').click();

    await page.waitForTimeout(1000);
    await page.locator('td[role="gridcell"]').filter({ hasText: "191" }).click();
    await page.waitForTimeout(500);

    // Select Requisition Type
    await page.locator('#P82_REQ_TYPE_lov_btn').click();
    await page.waitForSelector('li[data-id="F"]');
    await page.locator('li[data-id="F"]').click();
    await page.waitForTimeout(500);

    // Select Delivery Mode
    await page.locator('#P82_DEL_MODE_ID_lov_btn').click();
    await page.waitForTimeout(1000);
    await page.locator('td.a-GV-rowHeader:has-text("SEA*")').click();
    await page.waitForTimeout(500);

    // Fill Remarks
    await page.locator('#P82_REQ_REMARKS').fill("TEST..");
    await page.waitForTimeout(1000);

    //Clear the record
    // await page.getByRole('button',{name: 'Clear'}).click();

    //Save the record
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // Create request
    await page.locator('#B10569176539237699').click();
    await page.waitForTimeout(1000);

    // Request details (iframe)
    const frameelement = await page.frameLocator('iframe[title="Requisition Details"]');
    await frameelement.locator('#P84_SUPPLIER_SITE_ID_lov_btn').click();
    await page.waitForTimeout(1000); 
    await page.locator('tr[data-id="903"]').click();
    await page.waitForTimeout(1000);

    //  
    await frameelement.locator('#P84_MODEL_ID_lov_btn').click();
    await page.waitForTimeout(500);
    await page.locator('tr[data-id="1542"]').click();
    await page.waitForTimeout(500);


    // 
    await frameelement.locator('#P84_GRADE_ID').click();
    await page.waitForTimeout(500);
    await page.locator('tr[data-id="3370"]').click();
    await page.waitForTimeout(1000);

    //
    await frameelement.locator('#P84_OPTION_ID').click();
    await page.waitForTimeout(500);
    await page.locator('tr[data-id="3705"]').click();
    await page.waitForTimeout(500);

    //
    await frameelement.locator('#P84_OPTION_PACK_ID').click();
    await page.waitForTimeout(500);
    await page.locator('tr[data-id="4305"]').click();
    await page.waitForTimeout(500);

    //model year
    await frameelement.locator('#P84_MODEL_YEAR').click();
    await page.waitForTimeout(500);
    await page.locator('li[data-id="2016"]').click();
    await page.waitForTimeout(500);

    //Quantity

   // await frameelement.locator('#P84_RD_QUANTITY').fill('1');
    await frameelement.type('#P84_RD_QUANTITY','1');
    await page.waitForTimeout(1000);

    //Date required
    await frameelement.locator('#P84_DATE_REQUIRED_input').click();
    await page.getByRole('button', { name: 'Today' }).click();
    await page.waitForTimeout(1000);

    //Remarks
    await frameelement.locator('#P84_RD_REMARKS').fill("TEST");

    //Save
    await frameelement.getByRole('button',{name:'Save'}).click();





 






    //  await page.waitForTimeout(30000);
    await page.pause();

});