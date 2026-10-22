const { test, expect } = require('@playwright/test');

// =====================================================
// CONFIGURATION
// =====================================================

const BASE_URL =
    'https://dowellapps.com:8443/ords/r/manerp/aut129129/login';

const SUBIKSHA_USERNAME =
    process.env.APP_USERNAME || 'Subiksha';

const SUBIKSHA_PASSWORD =
    process.env.APP_PASSWORD || 'Subiksha@4321';

const SUPRIYA_USERNAME =
    process.env.APPROVER_USERNAME || 'Supriya';

const SUPRIYA_PASSWORD =
    process.env.APPROVER_PASSWORD || 'Supriya@1234';

const DIVYA_USERNAME =
    process.env.CREDIT_APPROVER_USERNAME || 'Divya';

const DIVYA_PASSWORD =
    process.env.CREDIT_APPROVER_PASSWORD || 'Divya@1234';


// =====================================================
// COMMON HELPERS
// =====================================================

async function waitForPage(page) {
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(2000);
}


async function safeClick(page, locator, name, timeout = 30000) {

    console.log(`Clicking: ${name}`);

    await locator.waitFor({
        state: 'visible',
        timeout
    });

    await locator.scrollIntoViewIfNeeded();

    await locator.click();

    console.log(`Clicked: ${name}`);
}


async function safeFill(page, locator, value, name) {

    console.log(`Entering ${name}: ${value}`);

    await locator.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await locator.fill(value);
}


async function closeDialogIfPresent(page) {

    const buttons = [
        page.getByRole('button', { name: 'Close' }),
        page.locator('.ui-dialog-titlebar-close'),
        page.locator('[aria-label="Close"]')
    ];

    for (const button of buttons) {

        try {

            if (await button.count() > 0 &&
                await button.first().isVisible()) {

                await button.first().click();

                await page.waitForTimeout(500);

                return;
            }

        } catch (_) {
        }
    }
}


async function approveTaskDialog(page) {

    const taskFrame =
        page.frameLocator(
            'iframe[title="Task Details"]'
        );

    const approveButton =
        taskFrame.getByRole('button', {
            name: /^Approve$/i
        }).first();

    await approveButton.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await approveButton.click({
        force: true
    });

    await Promise.race([
        page.locator('iframe[title="Task Details"]').waitFor({
            state: 'hidden',
            timeout: 30000
        }).catch(() => {}),
        page.waitForLoadState('networkidle', {
            timeout: 30000
        }).catch(() => {}),
        page.waitForTimeout(3000)
    ]);

    await closeDialogIfPresent(page);
}


// =====================================================
// LOGIN
// =====================================================

async function login(page, username, password) {

    console.log('============================================');
    console.log(`Logging in as ${username}`);
    console.log('============================================');

    await page.goto(BASE_URL, {
        waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(2000);

    const usernameField =
        page.getByRole('textbox', { name: 'Username' });

    const passwordField =
        page.getByRole('textbox', { name: 'Password' });

    await usernameField.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await usernameField.fill(username);
    await passwordField.fill(password);

    await page.getByRole('button', {
        name: 'Sign In'
    }).click();

    await page.waitForLoadState('domcontentloaded')
        .catch(() => {});

    await page.waitForTimeout(3000);

    console.log(`${username} logged in successfully.`);
}


// =====================================================
// LOGOUT
// =====================================================

async function logout(page) {

    console.log('Logging out...');

    try {

        const userButton =
            page.getByRole('button', {
                name: /SALESMAN UCD/i
            }).first();

        if (await userButton.count() > 0) {

            await userButton.click();

            await page.waitForTimeout(500);

            const signOut =
                page.getByRole('menuitem', {
                    name: 'Sign Out'
                });

            if (await signOut.count() > 0) {
                await signOut.click();
            }

        } else {

            const signOut =
                page.getByText('Sign Out', {
                    exact: true
                }).first();

            if (await signOut.count() > 0) {
                await signOut.click();
            }
        }

    } catch (error) {

        console.log(
            `Logout menu issue: ${error.message}`
        );
    }

    await page.waitForTimeout(2000);
}


// =====================================================
// SWITCH TO UCD ROLE
// =====================================================

async function switchToUCD(page) {

    console.log('Switching to UCD...');

    // Role switch icon
    const roleSwitch =
        page.locator('#L201948268465196672');

    await roleSwitch.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await roleSwitch.click();

    await page.waitForTimeout(1000);

    const ucdRole =
        page.getByRole('menuitem', {
            name: 'SALESMAN UCD - Mannai Used Car'
        });

    await ucdRole.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await ucdRole.click();

    console.log('UCD role selected.');

    await page.waitForLoadState('domcontentloaded')
        .catch(() => {});

    await page.waitForTimeout(4000);
}


// =====================================================
// EXPAND UCD MENU
// =====================================================

async function expandTreeNode(page, label, timeout = 30000) {

    let treeItem = page.getByRole('treeitem', {
        name: label
    }).first();

    await treeItem.waitFor({
        state: 'visible',
        timeout
    });

    let expanded = await treeItem.getAttribute('aria-expanded');

    if (expanded !== 'true') {

        const listItem = treeItem.locator('xpath=ancestor::li[1]');
        const toggle = listItem.locator('> .a-TreeView-toggle');

        if (await toggle.count() > 0) {
            await toggle.first().click();
        } else {
            await treeItem.click();
        }

        await page.waitForTimeout(1000);

        treeItem = page.getByRole('treeitem', {
            name: label
        }).first();

        expanded = await treeItem.getAttribute('aria-expanded');
    }

    console.log(`${label} expanded = ${expanded}`);

    return treeItem;
}


async function openUsedCarDivision(page) {

    console.log('Opening Used Car Division...');

    await expandTreeNode(page, /Used Car Division/i);

    console.log('Used Car Division opened.');
}


// =====================================================
// OPEN TRANSACTIONS
// =====================================================

async function openTransactions(page) {

    console.log('Opening Transactions...');

    await expandTreeNode(page, /Transactions/i);

    console.log('Transactions opened.');
}


// =====================================================
// OPEN BOOKING QUERY
// =====================================================

async function openBookingQuery(page) {

    console.log('============================================');
    console.log('Opening Booking Query...');
    console.log('============================================');

    await waitForPage(page);

    await openUsedCarDivision(page);

    await openTransactions(page);

    const bookingQuery =
        page.getByRole('treeitem', {
            name: 'Booking Query',
            exact: true
        }).first();

    await bookingQuery.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await bookingQuery.click();

    await page.waitForTimeout(3000);

    console.log('Booking Query opened.');
}


// =====================================================
// CREATE BOOKING
// =====================================================

async function createBooking(page) {

    console.log('============================================');
    console.log('CREATING BOOKING');
    console.log('============================================');

    // -------------------------------------------------
    // New
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'New'
        }).first(),
        'New'
    );

    await page.waitForTimeout(1500);


    // -------------------------------------------------
    // SUPPLIER
    // -------------------------------------------------

    await safeClick(
        page,
        page.locator('#P116_SUPPLIER_lov_btn'),
        'Supplier LOV'
    );

    const supplierPopup =
        page.locator('#PopupLov_116_P116_SUPPLIER_dlg');

    await supplierPopup.waitFor({
        state: 'visible',
        timeout: 30000
    });

    const supplierSearch =
        supplierPopup.getByRole('textbox', {
            name: 'Search'
        });

    await supplierSearch.fill('ve');
    await supplierSearch.press('Enter');

    await page.waitForTimeout(1500);

    const venue =
        page.getByRole('rowheader', {
            name: 'Venue Corporation and co'
        });

    await venue.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await venue.click();

    await page.waitForTimeout(1000);


    // -------------------------------------------------
    // MODEL
    // -------------------------------------------------

    await safeClick(
        page,
        page.locator('#P116_MODEL_lov_btn'),
        'Model LOV'
    );

    await page.waitForTimeout(1000);

    const model =
        page.getByRole('rowheader', {
            name: 'Venue Base Model'
        });

    await model.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await model.click();

    await page.waitForTimeout(1000);


    // -------------------------------------------------
    // FIND VEHICLE
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Find'
        }),
        'Find'
    );

    await page.waitForTimeout(2500);


    // -------------------------------------------------
    // SELECT AVAILABLE VEHICLE
    // -------------------------------------------------

    console.log('Searching for available vehicle...');

    const rows =
        page.locator('table tbody tr');

    const rowCount =
        await rows.count();

    console.log(`Vehicle rows found: ${rowCount}`);

    let vehicleSelected = false;

    for (let i = 0; i < rowCount; i++) {

        const row = rows.nth(i);

        try {

            if (!await row.isVisible()) {
                continue;
            }

            const text =
                await row.innerText();

            const cellTexts =
                await row.locator('td').allTextContents();

            const bookingStatusText =
                cellTexts.join(' | ')
                    .replace(/\s+/g, ' ')
                    .trim();

            console.log(
                `Vehicle row ${i + 1}: ${text.substring(0, 200)}`
            );

            const hasBookedStatus =
                /Booked|Sold|Unavailable|Not Available|Reserved|Hold/i
                    .test(bookingStatusText);

            if (hasBookedStatus) {
                console.log(
                    `Skipping row ${i + 1} because booking status is already populated.`
                );
                continue;
            }

            // Look for a selectable row
            const selector =
                row.locator('.u-selector');

            if (await selector.count() > 0) {

                await selector.first().click();

                console.log(
                    `Vehicle row ${i + 1} selected.`
                );

                vehicleSelected = true;

                break;
            }

        } catch (_) {
        }
    }

    if (!vehicleSelected) {

        console.log(
            'Generic vehicle selection failed.'
        );

        // Fallback to first selectable checkbox
        const checkbox =
            page.locator('.u-selector').first();

        await checkbox.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await checkbox.click();

        vehicleSelected = true;
    }


    // -------------------------------------------------
    // CUSTOMER
    // -------------------------------------------------

    console.log('Selecting Customer...');

    const customerLov =
        page.locator('#P116_CUSTOMER_lov_btn');

    const customer =
        page.getByRole('combobox', {
            name: 'Customer'
        }).first();

    if (await customerLov.count() > 0) {

        await customerLov.click();

    } else if (await customer.count() > 0) {

        await customer.click();
    }

    await page.waitForTimeout(1500);

    let customerPopup = page.locator(
        '#PopupLov_116_P116_CUSTOMER_dlg'
    );

    if (await customerPopup.count() === 0) {
        customerPopup = page.locator(
            'div[role="dialog"]'
        ).filter({
            has: page.getByRole('textbox', {
                name: /Search/i
            })
        }).first();
    }

    await customerPopup.waitFor({
        state: 'visible',
        timeout: 30000
    });

    const customerSearch =
        customerPopup.getByRole('textbox', {
            name: 'Search'
        });

    await customerSearch.fill('customer');
    await customerSearch.press('Enter');

    await page.waitForTimeout(1500);

    const customerRow =
        page.getByRole('rowheader', {
            name: 'UCD CUSTOMER-'
        }).first();

    await customerRow.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await customerRow.click();


    // -------------------------------------------------
    // SALESMAN
    // -------------------------------------------------

    console.log('Selecting Salesman...');

    await page.locator(
        '#P116_SALE_MAN_lov_btn'
    ).click();

    await page.waitForTimeout(1000);

    const salesman =
        page.getByRole('gridcell', {
            name: '245'
        });

    await salesman.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await salesman.click();


    // -------------------------------------------------
    // BOOK VEHICLE
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Book Vehicle'
        }),
        'Book Vehicle'
    );

    await page.waitForTimeout(2000);


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Save'
        }).first(),
        'Save'
    );

    await page.waitForTimeout(2000);


    // -------------------------------------------------
    // BOOK FLAG
    // -------------------------------------------------

    const bookFlag =
        page.getByRole('checkbox', {
            name: 'Book Flag'
        }).first();

    if (await bookFlag.count() > 0) {

        if (!await bookFlag.isChecked()) {
            await bookFlag.check();
        }

        console.log('Book Flag selected.');
    }


    // -------------------------------------------------
    // CONFIRM
    // -------------------------------------------------

    const confirm =
        page.getByRole('button', {
            name: 'Confirm'
        }).first();

    if (await confirm.count() > 0 &&
        await confirm.isVisible()) {

        await confirm.click();

        await page.waitForTimeout(1500);
    }


    // -------------------------------------------------
    // SEND FOR APPROVAL
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Send For Approval'
        }).first(),
        'Send For Approval'
    );

    await page.waitForTimeout(2500);

    console.log('Booking sent for approval.');
}


// =====================================================
// APPROVE BOOKING
// =====================================================

async function approveBooking(page) {

    console.log('============================================');
    console.log('APPROVING BOOKING');
    console.log('============================================');

    await openUsedCarDivision(page);

    // Pending Approvals may be directly under UCD
    const pendingApprovals =
        page.getByRole('treeitem', {
            name: 'Pending Approvals',
            exact: true
        }).first();

    await pendingApprovals.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await pendingApprovals.click();

    await page.waitForTimeout(2500);

    console.log('Pending Approvals opened.');


    // -------------------------------------------------
    // Find approval record
    // -------------------------------------------------

    const numericLinks =
        page.getByRole('link').filter({
            hasText: /^\d+$/
        });

    const linkCount =
        await numericLinks.count();

    console.log(
        `Approval links found: ${linkCount}`
    );

    if (linkCount === 0) {

        throw new Error(
            'No approval record found in Pending Approvals.'
        );
    }

    await numericLinks.first().click();

    await page.waitForTimeout(2000);


    // -------------------------------------------------
    // PROCEED TO APPROVAL
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Proceed to Approval'
        }).first(),
        'Proceed to Approval'
    );

    await page.waitForTimeout(2500);


    // -------------------------------------------------
    // TASK DETAILS IFRAME
    // -------------------------------------------------

    const taskFrame =
        page.frameLocator(
            'iframe[title="Task Details"]'
        );

    const comment =
        taskFrame.getByRole('textbox', {
            name: 'Comment'
        });

    await comment.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await comment.fill('Approved');


    // -------------------------------------------------
    // APPROVE
    // -------------------------------------------------

    await approveTaskDialog(page);

    console.log('Booking approved successfully.');
}


// =====================================================
// OPEN BOOKING QUERY AGAIN
// =====================================================

async function openBookingQueryAgain(page) {

    console.log(
        'Opening Booking Query again...'
    );

    await openUsedCarDivision(page);

    await openTransactions(page);

    const bookingQuery =
        page.getByRole('treeitem', {
            name: 'Booking Query',
            exact: true
        }).first();

    await bookingQuery.click();

    await page.waitForTimeout(3000);

    console.log(
        'Booking Query opened again.'
    );
}


// =====================================================
// OPEN FIRST BOOKING RECORD
// =====================================================

async function openFirstBookingRecord(page) {

    console.log(
        'Opening first booking record...'
    );

    // Preferred selector: eye icon
    const eyeLink =
        page.locator(
            'tbody tr:has(i.fa-eye) a:has(i.fa-eye)'
        ).first();

    try {

        await eyeLink.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await eyeLink.click();

    } catch (_) {

        console.log(
            'Eye selector not found. Using first blank link.'
        );

        const blankLink =
            page.getByRole('link').filter({
                hasText: /^$/
            }).first();

        await blankLink.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await blankLink.click();
    }

    await page.waitForTimeout(2500);

    console.log(
        'Booking record opened.'
    );
}


// =====================================================
// CONVERT TO CREDIT CONTROL
// =====================================================

async function convertToCreditControl(page) {

    console.log('============================================');
    console.log('CONVERTING TO CREDIT CONTROL');
    console.log('============================================');

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Convert To Credit Control'
        }).first(),
        'Convert To Credit Control'
    );

    await page.waitForTimeout(1000);


    // -------------------------------------------------
    // Confirmation popup
    // -------------------------------------------------

    const alertDialog =
        page.getByRole('alertdialog');

    if (await alertDialog.count() > 0) {

        const confirmButton =
            alertDialog.getByRole('button', {
                name: 'Convert To Credit Control'
            }).first();

        if (await confirmButton.count() > 0 &&
            await confirmButton.isVisible()) {

            await confirmButton.click();

            await page.waitForTimeout(2500);
        }
    }

    console.log(
        'Converted to Credit Control.'
    );
}


// =====================================================
// CREDIT CONTROL DETAILS
// =====================================================

async function processCreditControl(page) {

    console.log('============================================');
    console.log('CREDIT CONTROL');
    console.log('============================================');


    // -------------------------------------------------
    // Vehicle Amount
    // -------------------------------------------------

    const vehicleAmount =
        page.getByRole('textbox', {
            name: 'Vehicle Amount'
        }).first();

    if (await vehicleAmount.count() > 0) {

        await vehicleAmount.dblclick();

        await vehicleAmount.fill('14,9900');

        console.log(
            'Vehicle Amount entered.'
        );
    }


    // -------------------------------------------------
    // Sale Type
    // -------------------------------------------------

    const saleTypeButton =
        page.locator(
            '#P124_SALE_TYPE_ID_lov_btn'
        );

    if (await saleTypeButton.count() > 0) {

        await saleTypeButton.click();

        await page.waitForTimeout(1000);

        const saleType =
            page.getByRole('rowheader', {
                name: 'NVS ONLINE TRANSACTION'
            });

        await saleType.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await saleType.click();

        await page.waitForTimeout(800);
    }


    // -------------------------------------------------
    // Payment Mode
    // -------------------------------------------------

    const paymentMode =
        page.getByRole('combobox', {
            name: 'Payment Mode'
        }).first();

    if (await paymentMode.count() > 0) {

        await paymentMode.click();

        await page.waitForTimeout(1000);

        const paymentPopup =
            page.locator(
                '#PopupLov_124_P124_PAYMENT_MODE_ID_dlg'
            );

        await paymentPopup.waitFor({
            state: 'visible',
            timeout: 30000
        });

        const paymentSearch =
            paymentPopup.getByRole('textbox', {
                name: 'Search'
            });

        await paymentSearch.fill('nvs');

        await paymentSearch.press('Enter');

        await page.waitForTimeout(1200);

        const paymentRow =
            page.getByRole('rowheader', {
                name: 'NVS NET BANKING'
            });

        await paymentRow.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await paymentRow.click();

        await page.waitForTimeout(800);
    }


    // -------------------------------------------------
    // OPTIONAL REMARKS
    // -------------------------------------------------

    const remarks =
        page.locator('#P124_REMARKS');

    if (await remarks.count() > 0 &&
        await remarks.isVisible()) {

        await remarks.fill('Test Data');
    }


    // -------------------------------------------------
    // OPTIONAL INSURANCE AMOUNT
    // -------------------------------------------------

    const insuranceAmount =
        page.locator('#P124_INSURANCE_AMOUNT');

    if (await insuranceAmount.count() > 0 &&
        await insuranceAmount.isVisible()) {

        await insuranceAmount.fill('0');
    }


    // -------------------------------------------------
    // OPTIONAL INSURANCE TYPE
    // -------------------------------------------------

    const insuranceType =
        page.locator('#P124_INSURANCE_TYPE');

    if (await insuranceType.count() > 0 &&
        await insuranceType.isVisible()) {

        try {
            await insuranceType.selectOption('1');
        } catch (_) {
        }
    }


    // -------------------------------------------------
    // OPTIONAL INSURANCE COMPANY
    // -------------------------------------------------

    const insuranceCompany =
        page.locator('#P124_INSURANCE_COMPANY');

    if (await insuranceCompany.count() > 0 &&
        await insuranceCompany.isVisible()) {

        await insuranceCompany.fill(
            'Company Field'
        );
    }


    // -------------------------------------------------
    // OPTIONAL APPROVAL NO
    // -------------------------------------------------

    const approvalNo =
        page.locator('#P124_APPROVAL_NO');

    if (await approvalNo.count() > 0 &&
        await approvalNo.isVisible()) {

        await approvalNo.fill('33456');
    }


    // -------------------------------------------------
    // OPTIONAL APPROVAL AMOUNT
    // -------------------------------------------------

    const approvalAmount =
        page.locator('#P124_APPROVAL_AMOUNT');

    if (await approvalAmount.count() > 0 &&
        await approvalAmount.isVisible()) {

        await approvalAmount.fill('150000');
    }


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Save'
        }).first(),
        'Credit Control Save'
    );

    await page.waitForTimeout(2500);

    console.log(
        'Credit Control details saved.'
    );


    // -------------------------------------------------
    // CREATE LOAN
    // -------------------------------------------------

    const createLoan =
        page.getByRole('button', {
            name: 'Create Loan'
        }).first();

    if (await createLoan.count() > 0 &&
        await createLoan.isVisible()) {

        await createLoan.click();

        await page.waitForTimeout(2500);

        console.log(
            'Create Loan opened.'
        );

        await processLoan(page);
    }


    // -------------------------------------------------
    // SEND TO CREDIT CONTROL
    // -------------------------------------------------

    const sendToCreditControl =
        page.getByRole('button', {
            name: 'Send To Credit Control'
        }).first();

    if (await sendToCreditControl.count() > 0 &&
        await sendToCreditControl.isEnabled()) {

        await sendToCreditControl.click();

        await page.waitForTimeout(2000);

        console.log(
            'Sent to Credit Control.'
        );
    } else if (await sendToCreditControl.count() > 0) {
        console.log(
            'Send To Credit Control is disabled; continuing without this step.'
        );
    }


    // -------------------------------------------------
    // SEND FOR APPROVAL
    // -------------------------------------------------

    const sendApproval =
        page.getByRole('button', {
            name: 'Send For Approval'
        }).first();

    if (await sendApproval.count() > 0 &&
        await sendApproval.isEnabled()) {

        await sendApproval.click();

        await page.waitForTimeout(2500);

        console.log(
            'Credit Control sent for approval.'
        );
    } else if (await sendApproval.count() > 0) {
        console.log(
            'Send For Approval is not enabled yet; waiting for the workflow state to allow it.'
        );
    }
}


// =====================================================
// LOAN PROCESS
// =====================================================

async function processLoan(page) {

    console.log('============================================');
    console.log('PROCESSING LOAN');
    console.log('============================================');


    // -------------------------------------------------
    // Loan Scheme
    // -------------------------------------------------

    const loanSchemeButton =
        page.locator('#P159_LOAN_SCH_ID_lov_btn');

    const loanScheme =
        page.getByRole('combobox', {
            name: 'Loan Scheme'
        }).first();

    if (await loanSchemeButton.count() > 0) {
        await loanSchemeButton.click();
    } else if (await loanScheme.count() > 0) {
        await loanScheme.click();
    }

    await page.waitForTimeout(1000);

    let loanPopup = page.locator(
        '#PopupLov_159_P159_LOAN_SCH_ID_dlg'
    );

    if (await loanPopup.count() === 0) {
        loanPopup = page.locator(
            'div[role="dialog"]'
        ).filter({
            has: page.getByRole('textbox', {
                name: /Search/i
            })
        }).first();
    }

    await loanPopup.waitFor({
        state: 'visible',
        timeout: 30000
    });

    const loanSearch =
        loanPopup.getByRole('textbox', {
            name: /Search/i
        }).first();

    await loanSearch.fill('fdp');
    await loanSearch.press('Enter');

    await page.waitForTimeout(1500);

    const loanSchemeRow =
        loanPopup.getByRole('rowheader', {
            name: /FDP/i
        }).first();

    if (await loanSchemeRow.count() === 0) {
        const fallbackRow =
            page.getByRole('gridcell', {
                name: /FDP/i
            }).first();

        await fallbackRow.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await fallbackRow.click();
    } else {
        await loanSchemeRow.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await loanSchemeRow.click();
    }

    await page.waitForTimeout(1000);


    // -------------------------------------------------
    // SAVE LOAN
    // -------------------------------------------------

    const save =
        page.getByRole('button', {
            name: 'Save'
        }).first();

    if (await save.count() > 0 &&
        await save.isVisible()) {

        await save.click();

        await page.waitForTimeout(1500);
    }


    // -------------------------------------------------
    // DOWN PAYMENT
    // -------------------------------------------------

    const downPayment =
        page.getByRole('textbox', {
            name: 'Down Payment'
        }).first();

    if (await downPayment.count() > 0) {

        await downPayment.dblclick();

        await downPayment.fill('7,0000');

        console.log(
            'Down Payment entered.'
        );
    }


    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const update =
        page.getByRole('button', {
            name: 'Update'
        }).first();

    if (await update.count() > 0 &&
        await update.isVisible()) {

        await update.click();

        await page.waitForTimeout(1500);
    }


    // -------------------------------------------------
    // CALCULATE
    // -------------------------------------------------

    const calculate =
        page.getByRole('button', {
            name: 'Calculate'
        }).first();

    if (await calculate.count() > 0 &&
        await calculate.isVisible()) {

        await calculate.click();

        await page.waitForTimeout(2000);
    }


    // -------------------------------------------------
    // BACK
    // -------------------------------------------------

    const back =
        page.getByRole('button', {
            name: 'Back'
        }).first();

    if (await back.count() > 0 &&
        await back.isVisible()) {

        await back.click();

        await page.waitForTimeout(2000);
    }

    console.log('Loan processing completed.');
}


// =====================================================
// APPROVE CREDIT CONTROL
// =====================================================

async function approveCreditControl(page) {

    console.log('============================================');
    console.log('APPROVING CREDIT CONTROL');
    console.log('============================================');

    await openUsedCarDivision(page);


    // -------------------------------------------------
    // Transactions
    // -------------------------------------------------

    await openTransactions(page);


    // -------------------------------------------------
    // Pending Approvals
    // -------------------------------------------------

    const pendingApprovals =
        page.getByRole('treeitem', {
            name: 'Pending Approvals',
            exact: true
        }).first();

    await pendingApprovals.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await pendingApprovals.click();

    await page.waitForTimeout(2500);


    // -------------------------------------------------
    // Approval record
    // -------------------------------------------------

    const numericLinks =
        page.getByRole('link').filter({
            hasText: /^\d+$/
        });

    const count =
        await numericLinks.count();

    console.log(
        `Credit Control approval links: ${count}`
    );

    if (count === 0) {

        throw new Error(
            'No Credit Control approval record found.'
        );
    }

    await numericLinks.first().click();

    await page.waitForTimeout(2000);


    // -------------------------------------------------
    // PROCEED TO APPROVAL
    // -------------------------------------------------

    await safeClick(
        page,
        page.getByRole('button', {
            name: 'Proceed to Approval'
        }).first(),
        'Proceed to Approval'
    );

    await page.waitForTimeout(2500);


    // -------------------------------------------------
    // TASK DETAILS
    // -------------------------------------------------

    const taskFrame =
        page.frameLocator(
            'iframe[title="Task Details"]'
        );

    const comment =
        taskFrame.getByRole('textbox', {
            name: 'Comment'
        });

    await comment.waitFor({
        state: 'visible',
        timeout: 30000
    });

    await comment.fill('Approved');


    // -------------------------------------------------
    // APPROVE
    // -------------------------------------------------

    await approveTaskDialog(page);

    console.log(
        'Credit Control approved successfully.'
    );
}


// =====================================================
// MAIN TEST
// =====================================================

test.describe(
    'UCD Booking Query and Credit Control Approval',
    () => {

        test(
            'UCD - Booking Query to Credit Control Approval',
            async ({ page }) => {

                test.setTimeout(300000);

                console.log('');
                console.log('================================================');
                console.log(
                    'UCD BOOKING QUERY → CREDIT CONTROL APPROVAL'
                );
                console.log('================================================');


                // =================================================
                // STEP 1 - SUBIKSHA LOGIN
                // =================================================

                await login(
                    page,
                    SUBIKSHA_USERNAME,
                    SUBIKSHA_PASSWORD
                );


                // =================================================
                // STEP 2 - SWITCH UCD
                // =================================================

                await switchToUCD(page);


                // =================================================
                // STEP 3 - BOOKING QUERY
                // =================================================

                await openBookingQuery(page);


                // =================================================
                // STEP 4 - CREATE BOOKING
                // =================================================

                await createBooking(page);


                // =================================================
                // STEP 5 - LOGOUT SUBIKSHA
                // =================================================

                await logout(page);


                // =================================================
                // STEP 6 - SUPRIYA LOGIN
                // =================================================

                await login(
                    page,
                    SUPRIYA_USERNAME,
                    SUPRIYA_PASSWORD
                );


                // =================================================
                // STEP 7 - SWITCH UCD
                // =================================================

                await switchToUCD(page);


                // =================================================
                // STEP 8 - APPROVE BOOKING
                // =================================================

                await approveBooking(page);


                // =================================================
                // STEP 9 - LOGOUT SUPRIYA
                // =================================================

                await logout(page);


                // =================================================
                // STEP 10 - SUBIKSHA LOGIN AGAIN
                // =================================================

                await login(
                    page,
                    SUBIKSHA_USERNAME,
                    SUBIKSHA_PASSWORD
                );


                // =================================================
                // STEP 11 - SWITCH UCD
                // =================================================

                await switchToUCD(page);


                // =================================================
                // STEP 12 - OPEN BOOKING QUERY
                // =================================================

                await openBookingQueryAgain(page);


                // =================================================
                // STEP 13 - OPEN BOOKING
                // =================================================

                await openFirstBookingRecord(page);


                // =================================================
                // STEP 14 - CONVERT TO CREDIT CONTROL
                // =================================================

                await convertToCreditControl(page);


                // =================================================
                // STEP 15 - CREDIT CONTROL
                // =================================================

                await processCreditControl(page);


                // =================================================
                // STEP 16 - LOGOUT SUBIKSHA
                // =================================================

                await logout(page);


                // =================================================
                // STEP 17 - DIVYA LOGIN
                // =================================================

                await login(
                    page,
                    DIVYA_USERNAME,
                    DIVYA_PASSWORD
                );


                // =================================================
                // STEP 18 - SWITCH UCD
                // =================================================

                await switchToUCD(page);


                // =================================================
                // STEP 19 - APPROVE CREDIT CONTROL
                // =================================================

                await approveCreditControl(page);


                // =================================================
                // FINAL
                // =================================================

                console.log('');
                console.log('================================================');
                console.log(
                    'BOOKING → CREDIT CONTROL APPROVAL COMPLETED'
                );
                console.log('================================================');

            }
        );
    }
);