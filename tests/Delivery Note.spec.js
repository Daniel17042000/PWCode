import { test, expect } from '@playwright/test';
 
const DELIVERY_VEHICLE_NO =
    process.env.DELIVERY_VEHICLE_NO ||
    process.env.INVOICE_VEHICLE_NO ||
    '2915';
 
async function expandTreeNode(page, name) {
 
    let treeitem = page.getByRole('treeitem', {
        name
    }).first();
 
    await treeitem.waitFor({
        state: 'visible',
        timeout: 30000
    });
 
    const expanded = await treeitem.getAttribute('aria-expanded');
 
    if (expanded !== 'true') {
 
        const li = treeitem.locator('xpath=ancestor::li[1]');
        const toggle = li.locator('> .a-TreeView-toggle');
 
        if (await toggle.count() > 0) {
            await toggle.first().click();
        } else {
            await treeitem.click();
        }
 
        await page.waitForTimeout(1000);
 
        treeitem = page.getByRole('treeitem', {
            name
        }).first();
    }
 
    return treeitem;
}
 
 
test('UCD - Delivery Note', async ({ page }) => {
 
    test.setTimeout(180000);
 
    // =====================================================
    // LOGIN
    // =====================================================
 
    await page.goto(
        'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
        { waitUntil: 'domcontentloaded' }
    );
 
    await page.getByRole('textbox', {
        name: 'Username'
    }).fill('Subiksha');
 
    await page.getByRole('textbox', {
        name: 'Password'
    }).fill('Subiksha@4321');
 
    await page.getByRole('button', {
        name: 'Sign In'
    }).click();
 
    await page.waitForTimeout(3000);
 
 
    // =====================================================
    // SWITCH TO UCD
    // =====================================================
 
    await page.locator(
        '#L201948268465196672'
    ).click();
 
    await page.waitForTimeout(1000);
 
    await page.getByRole('menuitem', {
        name: 'SALESMAN UCD - Mannai Used Car'
    }).click();
 
    await page.waitForTimeout(4000);
 
 
    // =====================================================
    // USED CAR DIVISION
    // =====================================================
 
    await expandTreeNode(page, /Used Car Division/i);
 
 
    // =====================================================
    // TRANSACTIONS
    // =====================================================
 
    await expandTreeNode(page, /Transactions/i);
 
 
    // =====================================================
    // DELIVERY NOTE
    // =====================================================
 
    await page.getByRole('treeitem', {
        name: 'Delivery Note',
        exact: true
    }).click();
 
    await page.waitForTimeout(2500);
 
 
    // =====================================================
    // NEW
    // =====================================================
 
    await page.getByRole('button', {
        name: 'New'
    }).click();
 
    await page.waitForTimeout(1500);
 
 
    // =====================================================
    // DELIVERY DATE
    // =====================================================
 
    await page.locator(
        '#P165_DEL_DATE'
    ).getByRole('button', {
        name: 'Select Date'
    }).click();
 
    await page.waitForTimeout(500);
 
    // Current recorded date = 22
    await page.getByRole('gridcell', {
        name: '22',
        exact: true
    }).click();
 
 
    // =====================================================
    // DELIVERED BY
    // =====================================================
 
    await page.getByRole('textbox', {
        name: 'Delivered By'
    }).fill('Warehouse Team');
 
 
    // =====================================================
    // FIRST SERVICE APPOINTMENT DATE
    // =====================================================
 
    await page.locator(
        '#P165_FIRST_SERV_APP_DT'
    ).getByRole('button', {
        name: 'Select Date'
    }).click();
 
    await page.waitForTimeout(500);
 
 
    // =====================================================
    // MILEAGE
    // =====================================================
 
    await page.getByRole('textbox', {
        name: 'Mileage'
    }).fill('0');
 
 
    // =====================================================
    // VEHICLE NUMBER
    // =====================================================
 
    const vehicleNoField = page.getByRole('combobox', {
        name: 'Vehicle No'
    });

    const vehicleNoId = await vehicleNoField.getAttribute('id');
    const vehicleLovButton = page.locator(`#${vehicleNoId}_lov_btn`);

    await vehicleLovButton.click();

    const vehicleDialog = page.locator(
        '[id^="PopupLov_"][id$="_dlg"]:visible, .a-PopupLOV:visible, div[role="dialog"]:visible'
    ).last();

    await vehicleDialog.waitFor({
        state: 'visible',
        timeout: 30000
    });

    const vehicleSearch = vehicleDialog.locator(
        'input[aria-label="Search"]:visible, input.a-PopupLOV-search:visible'
    ).first();

    await vehicleSearch.fill(DELIVERY_VEHICLE_NO);

    const vehicleSearchButton = vehicleDialog.locator(
        'button.a-PopupLOV-doSearch:visible'
    );

    if (await vehicleSearchButton.count() > 0) {
        await vehicleSearchButton.click();
    } else {
        await vehicleSearch.press('Enter');
    }

    const vehicleLovRow = vehicleDialog.locator(
        'tr[role="row"]:visible'
    ).first();

    await vehicleLovRow.waitFor({
        state: 'visible',
        timeout: 30000
    });
    await vehicleLovRow.click();
 
    await page.waitForTimeout(1500);
 
 
    // =====================================================
    // SAVE
    // =====================================================
 
    await page.getByRole('button', {
        name: 'Save',
        exact: true
    }).click();
 
    await page.waitForTimeout(2000);
 
 
    // =====================================================
    // FINALIZE
    // =====================================================
 
    await page.getByRole('button', {
        name: 'Finalize'
    }).click();
 
    await page.waitForTimeout(2500);
 
 
    // =====================================================
    // BACK
    // =====================================================
 
    await page.getByRole('button', {
        name: 'Back'
    }).click();
 
    await page.waitForTimeout(2000);
 
 
    // =====================================================
    // SEARCH DELIVERY NOTE
    // =====================================================
 
    await page.getByRole('textbox', {
        name: 'Delivery Note No'
    }).fill('43');
 
    await page.getByRole('button', {
        name: 'Search',
        exact: true
    }).click();
 
    await page.waitForTimeout(2000);
 
 
    // =====================================================
    // OPEN DELIVERY NOTE
    // =====================================================
 
    const recordLink =
        page.getByRole('link').filter({
            hasText: /^$/
        }).first();
 
    await recordLink.waitFor({
        state: 'visible',
        timeout: 30000
    });
 
    await recordLink.click();
 
    await page.waitForTimeout(2000);
 
 
    // =====================================================
    // BACK
    // =====================================================
 
    await page.getByRole('button', {
        name: 'Back'
    }).click();
 
    console.log(
        '============================================'
    );
 
    console.log(
        'DELIVERY NOTE FLOW COMPLETED'
    );
 
    console.log(
        '============================================'
    );
});