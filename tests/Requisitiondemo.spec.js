import { test, expect } from '@playwright/test';

test('Requisition Screen Create New Request and Approve', async ({ page }) => {

    // ============================================================
    // LOGIN - DANIEL
    // ============================================================

    await page.goto(
        'https://dowellapps.com:8443/ords/r/manerp/aut129129/login'
    );

    await page.setViewportSize({ width: 1000, height: 600 });

    await page.locator('#P9999_USERNAME').fill('Daniel');
    await page.locator('#P9999_PASSWORD').fill('Daniel@1234');

    await page.locator('#P9999_REMEMBER').check();

    await page.getByText('Sign In', { exact: true }).click();

    console.log('Login Successfully');


    // ============================================================
    // SELECT ROLE
    // ============================================================

    await page.locator('span.t-Icon.fa.fa-random').click();
    await page.waitForTimeout(1000);

const salesmanMenu = page.getByRole('menuitem', {
    name: /Salesman NVS - New Vehicle Sales/
});

await expect(salesmanMenu).toBeVisible({
    timeout: 15000
});

await salesmanMenu.dblclick();


    // ============================================================
    // GO TO REQUISITION SCREEN

await page.getByRole('treeitem', {
    name: 'New Vehicle Sales',
    exact: true
}).click();

console.log('New Vehicle Sales clicked.');

await page.waitForTimeout(1000);

    await page.getByRole('treeitem', {
        name: 'Transactions'
    }).click();

await page.waitForTimeout(1000);

    await page.getByRole('treeitem', {
        name: 'Requisition'

    }).click();

    await page.locator('#BTNS_onlyicon').click();

    console.log('Successfully redirected to Requisition Screen');


    // ============================================================
    // FILLING NEW REQUISITION FORM
    // ============================================================

    // SALESMAN
    await page.locator('#P82_SALESMAN_ID').click();

    await page.locator(
        'input.a-PopupLOV-search.apex-item-text'
    ).fill('Apriltest');

    await page.keyboard.press('Enter');

    await page.getByText('AprilTest', {
        exact: true
    }).click();


    // REQUEST TYPE
    await page.locator('#P82_REQ_TYPE').click();

    await page.getByText('Fleet', {
        exact: true
    }).click();


    // DELIVERY MODE
    await page.locator('#P82_DEL_MODE_ID').click();

    await page.getByText('SEA', {
        exact: true
    }).click();


    // REMARKS
    await page.locator('#P82_REQ_REMARKS').fill('TEST');

   await page.waitForTimeout(1000);
    // SAVE
    await page.getByText('Save', {
        exact: true
    }).click();

    await page.getByText('New', {
        exact: true
    }).click();

    console.log('Requisition Header created Successfully');


    // ============================================================
    // GET REQUISITION NUMBER
    // ============================================================

    const requisitionNo = await page.locator(
        '#P82_REQ_NO_DISPLAY'
    ).innerText();

    console.log('Requisition No: ' + requisitionNo);


    // ============================================================
    // REQUISITION DETAILS IFRAME
    // ============================================================

    const requisitionFrame = page.frameLocator(
        'iframe[src*="requisition-b1"]'
    );


    // ============================================================
    // SUPPLIER
    // ============================================================

    await requisitionFrame
        .locator('#P84_SUPPLIER_SITE_ID_lov_btn')
        .click();

    // Popup is in main document
    await page.getByText(
        'Venue Corporation and co',
        { exact: true }
    ).click();

    console.log('Supplier Selected');


    // ============================================================
    // MAKE
    // ============================================================

    await requisitionFrame
        .locator('#P84_MODEL_ID')
        .click();

    await page.getByText(
        'VENUE',
        { exact: true }
    ).click();

    console.log('Make Selected');


    // ============================================================
    // MODEL
    // ============================================================

    await requisitionFrame
        .locator('#P84_GRADE_ID')
        .click();

    await page.getByText(
        'VENUE SUV',
        { exact: true }
    ).click();

    console.log('Model Selected');


    // ============================================================
    // MODEL CODE
    // ============================================================

    await requisitionFrame
        .locator('#P84_OPTION_ID')
        .click();

    await page.getByText(
        'VENUE BASE MODEL (HX2)',
        { exact: true }
    ).click();

    console.log('Model Code Selected');


    // ============================================================
    // TRIM
    // ============================================================

    await requisitionFrame
        .locator('#P84_OPTION_PACK_ID')
        .click();

    await page.getByText(
        'VENUE (HX10)',
        { exact: true }
    ).click();

    console.log('Trim Selected');


    // ============================================================
    // MODEL YEAR
    // ============================================================

    await requisitionFrame
        .locator('#P84_MODEL_YEAR')
        .click();

    await page.locator('li[data-id="2026"]').click();

    console.log('Model Year Selected');


    // ============================================================
    // QUANTITY
    // ============================================================

    await requisitionFrame
        .locator('#P84_RD_QUANTITY')
        .fill('1');

    console.log('Quantity Selected');


    // ============================================================
    // UNIT PRICE
    // ============================================================

    await requisitionFrame
        .locator('#P84_RD_UNIT_PRICE')
        .fill('1000');


    // ============================================================
    // DATE REQUIRED
    // ============================================================

    await requisitionFrame
        .locator('#P84_DATE_REQUIRED_input')
        .click();

    // Date picker is in main document
    await page.getByRole('button', {
        name: 'Today'
    }).click();


    // ============================================================
    // REMARKS
    // ============================================================

    await requisitionFrame
        .locator('#P84_RD_REMARKS')
        .fill('Test Data');

    console.log('Remarks filled');


    // ============================================================
    // SAVE REQUISITION DETAIL
    // ============================================================

    await requisitionFrame
        .getByText('Save', { exact: true })
        .click();

    console.log('Requisition Detail Saved Successfully');


    // ============================================================
    // SEND FOR APPROVAL
    // ============================================================

    // Wait for APEX processing spinner
    await waitForProcessingToClear(page);

    await page.getByRole('button', {
        name: 'Send For Approval'
    }).click();

    console.log(
        'Requisition request has been sent Successfully'
    );


    // ============================================================
    // GET GENERATED DOCUMENT NUMBER
    // ============================================================

    const successText = await page.locator(
        '#page_success_id ~ div'
    ).first().innerText();

    const number1 = successText.replace(/\D+/g, '');

    console.log(
        'Generated Document No: ' + number1
    );


    // ============================================================
    // LOGOUT DANIEL
    // ============================================================

    await waitForProcessingToClear(page);

    await page.getByText(
        'Daniel Vinith G',
        { exact: true }
    ).click();

    console.log('Daniel user menu clicked.');

    await page.getByText(
        'Sign Out',
        { exact: true }
    ).click();

    console.log('Login page displayed');


    // ============================================================
    // LOGIN - SUPRIYA APPROVER
    // ============================================================

    await page.locator('#P9999_USERNAME').fill('Supriya');

    await page.locator('#P9999_PASSWORD').fill(
        'Supriya@1234'
    );

    await page.locator('#P9999_REMEMBER').check();

    await page.locator('#B671672845046722778').click();

    console.log('Approver logged in Successfully');


    // ============================================================
    // WORKFLOW
    // ============================================================

    await waitForProcessingToClear(page);

    await page.getByText(
        'New Vehicle Sales',
        { exact: true }
    ).click();


    // Workflow Documents
    await page.getByRole('treeitem', {
        name: 'Workflow Documents'
    }).click();


    // Approvals Documents
    await page.getByRole('treeitem', {
        name: 'Approvals Documents'
    }).click();

    await waitForProcessingToClear(page);


    // ============================================================
    // FIND REQUISITION ROW
    // ============================================================

    const requisitionRow = page.locator(
        'tbody tr',
        {
            has: page.locator(
                'td',
                { hasText: 'Requisition' }
            )
        }
    ).first();

    await expect(requisitionRow).toBeVisible();

    console.log('Requisition row found.');


    // ============================================================
    // GET DOCUMENT NUMBER FROM SAME ROW
    // ============================================================

    const documentNumber = requisitionRow.locator(
        'td:first-child a'
    );

    const requisitionDocumentNo =
        await documentNumber.innerText();

    console.log(
        'Latest Requisition Document No: ' +
        requisitionDocumentNo
    );


    // ============================================================
    // CLICK DOCUMENT NUMBER
    // ============================================================

    await documentNumber.click();


    // ============================================================
    // CLICK APPROVAL DETAILS
    // ============================================================

    await page.locator(
        '#R765199120085852066 > div:nth-child(2) > div:nth-child(2) > button'
    ).click();


    // ============================================================
    // TASK DETAILS IFRAME
    // ============================================================

    const taskFrame = page.frameLocator(
        'iframe[src*="task-details1"]'
    );


    // ============================================================
    // COMMENT
    // ============================================================

    await taskFrame
        .locator('#P246_COMMENT_TEXT')
        .fill('Procced to Approved');


    // ============================================================
    // APPROVE
    // ============================================================

    await page.locator('#approve-button').click();

    console.log('Request has been Approved');


    // ============================================================
    // REFRESH
    // ============================================================

    await page.reload();

});


// ============================================================
// APEX PROCESSING WAIT
// ============================================================

async function waitForProcessingToClear(page) {

    const processing = page.locator('.u-Processing');

    try {

        await processing.waitFor({
            state: 'hidden',
            timeout: 15000
        });

    } catch (error) {

        // Spinner may not exist.
        console.log('APEX processing spinner not present.');

    }
}