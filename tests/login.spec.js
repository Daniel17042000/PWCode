const { test, expect } = require('@playwright/test');
const path = require('path');


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


// ============================================================
// WAIT FOR ELEMENT
// ============================================================
async function waitAndClick(locator, timeout = 15000) {
    await locator.waitFor({
        state: 'visible',
        timeout
    });

    await locator.click();
}


// ============================================================
// ROBUST NAVIGATION WITH RETRY
// ============================================================
async function gotoWithRetry(page, url, { attempts = 3, timeout = 90000 } = {}) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            console.log(`Navigation attempt ${attempt} to ${url}...`);

            // 'load' waits for the full page (including its
            // resources) to finish, avoiding the blank/half-loaded
            // page that can show up on the very first navigation
            // if we resolve too early on just 'commit'.
            await page.goto(url, {
                waitUntil: 'load',
                timeout
            });

            await page.waitForLoadState('domcontentloaded', {
                timeout: 30000
            });

            // Guard against a blank/empty first paint: if the
            // login username field never shows up, treat this
            // as a failed attempt and retry rather than pressing
            // on with a blank page.
            const usernameCheck = page.locator('#P9999_USERNAME');
            await usernameCheck.waitFor({
                state: 'visible',
                timeout: 20000
            });

            return; // success
        } catch (err) {
            lastError = err;
            console.log(`Attempt ${attempt} failed: ${err.message}`);

            if (attempt < attempts) {
                await page.waitForTimeout(2000);
            }
        }
    }

    throw new Error(
        `Failed to navigate to ${url} after ${attempts} attempts: ${lastError?.message}`
    );
}


// ============================================================
// UCD EVALUATION WORKFLOW
// ============================================================
test.describe('UCD Evaluation Workflow', () => {

    test(
        'Create and approve UCD evaluation',
        async ({ page }) => {

            // ========================================================
            // BROWSER / PAGE SETTINGS 
            // ========================================================

            await page.setViewportSize({
                width: 1280,
                height: 720
            });

            // Apply generous defaults for this whole test, in case
            // any other navigation (not just the first goto) is slow.
            page.setDefaultNavigationTimeout(90000);
            page.setDefaultTimeout(30000);


            // ========================================================
            // 1. LOGIN
            // ========================================================

            console.log('Opening Login page...');

            await gotoWithRetry(
                page,
                'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
                { attempts: 3, timeout: 90000 }
            );

            console.log('Login page opened');


            // Username
            const username = page.locator(
                '#P9999_USERNAME'
            );

            await username.waitFor({
                state: 'visible',
                timeout: 20000
            });

            await username.fill(
                'Subiksha'
            );


            // Password
            const password = page.locator(
                '#P9999_PASSWORD'
            );

            await password.fill(
                'Subiksha@4321'
            );


            // Remember Me
            const rememberMe = page.locator(
                '#P9999_REMEMBER'
            );

            if (await rememberMe.count() > 0) {
                await rememberMe.check();
            }


            // Sign In
            const signInButton = page.locator(
                "xpath=//button[.//span[text()='Sign In']] | //button[normalize-space()='Sign In']"
            ).first();

            await waitAndClick(
                signInButton,
                15000
            );

            console.log(
                'Login Successfully'
            );


            // Wait for login processing
            await waitForProcessingToClear(
                page
            );

            await page.waitForLoadState(
                'domcontentloaded'
            );

            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 2. SELECT ROLE
            // ========================================================

            console.log(
                'Selecting role...'
            );


            const roleIcon = page.locator(
                'span.t-Icon.fa.fa-random, .t-Icon.fa-random'
            ).first();


            await roleIcon.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await roleIcon.click();


            const roleMenu = page.getByRole(
                'menuitem',
                {
                    name: 'SALESMAN UCD - Mannai Used Car'
                }
            );


            try {

                await roleMenu.waitFor({
                    state: 'visible',
                    timeout: 5000
                });

            } catch {

                console.log(
                    'Role menu did not open. Retrying...'
                );

                await roleIcon.click();

                await roleMenu.waitFor({
                    state: 'visible',
                    timeout: 10000
                });
            }


            await roleMenu.click();


            console.log(
                'Role selected'
            );


            await waitForProcessingToClear(
                page
            );

            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 3. OPEN EVALUATION
            // ========================================================

            console.log(
                'Opening Evaluation...'
            );


            const firstTreeToggle = page.locator(
                '.a-TreeView-toggle'
            ).first();


            await firstTreeToggle.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await firstTreeToggle.click();


            const secondTreeToggle = page.locator(
                '#t_TreeNav_2 > .a-TreeView-toggle'
            );


            await secondTreeToggle.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await secondTreeToggle.click();


            const evaluationMenu = page.getByRole(
                'treeitem',
                {
                    name: 'Evaluation'
                }
            );


            await evaluationMenu.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await evaluationMenu.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                2000
            );


            console.log(
                'Evaluation page opened'
            );


            // ========================================================
            // 4. CLICK NEW
            // ========================================================

            console.log(
                'Creating new evaluation...'
            );


            const newButton = page.getByRole(
                'button',
                {
                    name: 'New'
                }
            );


            await newButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await newButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 5. FRANCHISE
            // ========================================================

            console.log(
                'Selecting Franchise...'
            );


            const franchiseLov = page.locator(
                '#P802_FRANCHISE_VALIDATE_lov_btn'
            );


            await franchiseLov.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await franchiseLov.click();


            const mannaiFranchise = page.getByRole(
                'option',
                {
                    name: 'Mannai Franchise',
                    exact: true
                }
            );


            await mannaiFranchise.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await mannaiFranchise.click();


            // ========================================================
            // 6. TRADE TYPE
            // ========================================================

            console.log(
                'Selecting Trade Type...'
            );


            const tradeTypeLov = page.locator(
                '#P802_TRADE_TYPE_lov_btn'
            );


            await tradeTypeLov.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await tradeTypeLov.click();


            const interDepartmentTrade = page.getByRole(
                'option',
                {
                    name: 'Inter Department',
                    exact: true
                }
            );


            await interDepartmentTrade.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await interDepartmentTrade.click();


            // ========================================================
            // 7. VEHICLE TYPE
            // ========================================================

            console.log(
                'Selecting Vehicle Type...'
            );


            // Clicking the combobox TEXT FIELD does not open the
            // popup — same as Franchise/Trade Type, you must click
            // the dedicated LOV button. We read the field's actual
            // id and derive the button/dialog ids using the same
            // naming convention as the other popup-LOV fields on
            // this page (#<id>_lov_btn, #PopupLov_802_<id>_dlg),
            // instead of hardcoding a guess.
            const vehicleNoCombobox = page.getByRole(
                'combobox',
                {
                    name: 'Mannai / Non-Mannai Vehicle'
                }
            );
            


            await vehicleNoCombobox.waitFor({
                state: 'visible',
                timeout: 15000
            });


            const vehicleNoId = await vehicleNoCombobox.getAttribute(
                'id'
            );


            const vehicleNoBtn = page.locator(
                `#${vehicleNoId}_lov_btn`
            );


            await vehicleNoBtn.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await vehicleNoBtn.click();


            const vehicleDialog = page.locator(
                `#PopupLov_802_${vehicleNoId}_dlg`
            );


            await vehicleDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await waitForProcessingToClear(
                page
            );


            // Check the Reg No column dynamically for a non-null / non-empty value and click it
            const regNoHeader = vehicleDialog.locator('th, th .a-GV-headerLabel').filter({
                hasText: /^Reg No$/i
            }).first();

            let regNoColIndex = -1;
            if (await regNoHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
                regNoColIndex = await regNoHeader.evaluate(el => {
                    const th = el.closest('th');
                    return th ? Array.from(th.parentElement.children).indexOf(th) : -1;
                });
            }

            let clicked = false;
            const dataRows = vehicleDialog.locator('tr.a-GV-row:has(td[role="gridcell"]), tr[role="row"]:has(td[role="gridcell"])');
            await expect(
                dataRows.first()
            ).toBeVisible({
                timeout: 15000
            });

            const rowCount = await dataRows.count();

            for (let i = 0; i < rowCount; i++) {
                const row = dataRows.nth(i);
                if (regNoColIndex !== -1) {
                    const cell = row.locator('td, td[role="gridcell"]').nth(regNoColIndex);
                    const cellText = (await cell.innerText()).trim();
                    if (cellText.length > 0 && cellText !== '-' && cellText !== '&nbsp;') {
                        console.log(`Found non-empty Reg No at row ${i + 1}: "${cellText}", clicking element...`);
                        await cell.click();
                        clicked = true;
                        break;
                    }
                }
            }

            // Fallback: click the first available data row if specific column wasn't indexed
            if (!clicked && rowCount > 0) {
                const firstRow = dataRows.first();
                await firstRow.waitFor({ state: 'visible', timeout: 15000 });
                console.log('Selected vehicle row:', (await firstRow.innerText()).replace(/\s+/g, ' ').trim());
                await firstRow.click();
                clicked = true;
            }

            await expect(
                vehicleDialog
            ).toBeHidden({
                timeout: 15000
            });


            // Confirm the Vehicle Type Code field actually
            // auto-populated as a result of this selection before
            // moving on.
            const vehicleTypeInput = page.locator(
                '#P802_GRADE_ID'
            );

            await waitForProcessingToClear(
                page
            );

            await expect(
                vehicleTypeInput
            ).not.toHaveValue(
                '',
                { timeout: 15000 }
            );

            console.log(
                'Vehicle Type auto-populated:',
                await vehicleTypeInput.inputValue()
            );


            // ========================================================
            // 8. DEAL THROUGH
            // ========================================================

            console.log(
                'Selecting Deal Through...'
            );


            const dealThroughLov = page.locator(
                '#P802_DEAL_THRU_lov_btn'
            );


            await dealThroughLov.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await dealThroughLov.click();


            const dealThroughOption = page.getByRole(
                'option',
                {
                    name: 'Inter Department',
                    exact: true
                }
            );


            await dealThroughOption.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await dealThroughOption.click();


            // ========================================================
            // 9. ACCOUNT
            // ========================================================

            console.log(
                'Selecting Account...'
            );


            // Same pattern as Vehicle No: clicking the combobox
            // text field alone isn't reliable — use the dedicated
            // LOV button (derived from the field's real id) and
            // scope the result search to that field's own dialog.
            const account = page.getByRole(
                'combobox',
                {
                    name: 'Account'
                }
            );


            await account.waitFor({
                state: 'visible',
                timeout: 15000
            });


            const accountId = await account.getAttribute(
                'id'
            );


            const accountBtn = page.locator(
                `#${accountId}_lov_btn`
            );


            await accountBtn.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await accountBtn.click();


            const accountDialog = page.locator(
                `#PopupLov_802_${accountId}_dlg`
            );


            await accountDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await waitForProcessingToClear(
                page
            );


            // Try searching for the account inside the dialog, in
            // case the grid doesn't show it on the default/first
            // page of results.
            const accountSearch = accountDialog.getByRole(
                'textbox',
                {
                    name: 'Search'
                }
            );


            if (await accountSearch.count() > 0) {
                await accountSearch.fill(
                    'UCD - INTER DEPARTMENT'
                );

                await accountSearch.press(
                    'Enter'
                );

                await waitForProcessingToClear(
                    page
                );
            }


            const accountOption = accountDialog.getByRole(
                'gridcell',
                {
                    name: 'UCD - INTER DEPARTMENT'
                }
            ).first();


            await accountOption.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await accountOption.click();


            // ========================================================
            // 10. EVALUATION PRICE
            // ========================================================

            console.log(
                'Entering Evaluation Price...'
            );


            const evaluationPrice = page.getByRole(
                'textbox',
                {
                    name: 'Evaluation Price'
                }
            );


            await evaluationPrice.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await evaluationPrice.fill(
                '2500'
            );


            // ========================================================
            // 11. MILEAGE
            // ========================================================

            console.log(
                'Entering Mileage...'
            );


            const mileage = page.getByRole(
                'textbox',
                {
                    name: 'Mileage'
                }
            );


            await mileage.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await mileage.fill(
                '180'
            );


            // ========================================================
            // 12. EVALUATOR
            // ========================================================

            console.log(
                'Selecting Evaluator...'
            );


            const evaluatorLov = page.locator(
                '#P802_EVALUATOR_lov_btn'
            );


            await evaluatorLov.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await evaluatorLov.click();


            const evaluatorDialog = page.locator(
                '#PopupLov_802_P802_EVALUATOR_dlg'
            );


            await evaluatorDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });


            const evaluatorSearch =
                evaluatorDialog.getByRole(
                    'textbox',
                    {
                        name: 'Search'
                    }
                );


            await evaluatorSearch.fill(
                'ucd'
            );


            await evaluatorSearch.press(
                'Enter'
            );


            const evaluator = page.getByRole(
                'gridcell',
                {
                    name: 'UCD Salesman'
                }
            ).first();


            await evaluator.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await evaluator.click();


            // ========================================================
            // 13. SAVE
            // ========================================================

            console.log(
                'Saving Evaluation...'
            );


            const saveButton = page.getByRole(
                'button',
                {
                    name: 'Save'
                }
            );


            await saveButton.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await saveButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1500
            );


            console.log(
                'Evaluation saved'
            );


            // ========================================================
            // 14. UPLOAD
            // ========================================================

            console.log(
                'Opening Upload...'
            );


            const uploadButton = page.getByRole(
                'button',
                {
                    name: 'Upload'
                }
             );



            await uploadButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await uploadButton.click();


            await page.waitForTimeout(
                1000
            );


            // ========================================================
            // 15. CHOOSE FILE
            // ========================================================

            console.log(
                'Selecting file from file manager...'
            );

            const fs = require('fs');
            const picturesDir = 'C:\\Users\\Daniel Vinith\\OneDrive\\Pictures';
            const baseFileName = 'midnight-black-challenger-3c-5120x2880';
            
            let imagePath = path.join(picturesDir, `${baseFileName}.jpg`);
            if (!fs.existsSync(imagePath)) {
                if (fs.existsSync(path.join(picturesDir, `${baseFileName}.png`))) {
                    imagePath = path.join(picturesDir, `${baseFileName}.png`);
                } else if (fs.existsSync(path.join(picturesDir, `${baseFileName}.jpeg`))) {
                    imagePath = path.join(picturesDir, `${baseFileName}.jpeg`);
                } else if (fs.existsSync(path.join(picturesDir, baseFileName))) {
                    imagePath = path.join(picturesDir, baseFileName);
                }
            }

            const chooseFileButton = page.locator(
                '#P1077_FILE_BROWSE_input, input[type="file"], input.apex-item-file'
            ).first();

            await chooseFileButton.waitFor({
                state: 'attached',
                timeout: 15000
            });

            // Listen for the file chooser event triggered by clicking the button
            const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
            await chooseFileButton.click({ force: true });
            const fileChooser = await fileChooserPromise;

            if (fileChooser) {
                await fileChooser.setFiles(imagePath);
            } else {
                await chooseFileButton.setInputFiles(imagePath);
            }

            console.log(
                'File selected and opened from file manager:',
                imagePath
            );


            // ========================================================
            // 16. IMAGE TYPE
            // ========================================================

            console.log(
                'Selecting Image Type...'
            );


            const imageTypeLov = page.locator(
                '#P1077_IMG_TYPE_lov_btn'
            );


            await imageTypeLov.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await imageTypeLov.click();


            const licenseOption = page.getByRole(
                'rowheader',
                {
                    name: 'License'
                }
            );


            await licenseOption.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await licenseOption.click();


            // Confirm Image Type actually got set — the "Add"
            // button may silently no-op or stay disabled if this
            // field is still empty.
            const imageTypeInput = page.locator(
                '#P1077_IMG_TYPE'
            );

            await expect(
                imageTypeInput
            ).not.toHaveValue(
                '',
                { timeout: 10000 }
            );

            console.log(
                'Image Type set:',
                await imageTypeInput.inputValue()
            );


            // ========================================================
            // 17. ADD ATTACHMENT
            // ========================================================

            console.log(
                'Adding attachment...'
            );


            const addButton = page.getByRole(
                'button',
                {
                    name: 'Add'
                }
            );


            await addButton.waitFor({
                state: 'visible',
                timeout: 15000
            });


            // Make sure the button is actually enabled before
            // clicking — if the file or Image Type didn't register,
            // this often stays disabled rather than throwing.
            await expect(
                addButton
            ).toBeEnabled(
                { timeout: 10000 }
            );


            await addButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1000
            );


            console.log(
                'Attachment added'
            );


            // ========================================================
            // 18. BACK
            // ========================================================

            console.log(
                'Going back...'
            );


            const backButton = page.getByRole(
                'button',
                {
                    name: 'Back'
                }
            );


            await backButton.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await backButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 19. SEND TO ESTIMATOR
            // ========================================================

            console.log(
                'Sending to Estimator...'
            );


            const sendEstimatorButton =
                page.getByRole(
                    'button',
                    {
                        name: 'Send To Estimator'
                    }
                );


            await sendEstimatorButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await sendEstimatorButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 20. ESTIMATOR
            // ========================================================

            // console.log(
            //     'Selecting Estimator...'
            // );


            // const estimatorButton =
            //     page.getByRole(
            //         'button',
            //         {
            //             name: 'Estimator'
            //         }
            //     );


            // await estimatorButton.waitFor({
            //     state: 'visible',
            //     timeout: 20000
            // });


            // await estimatorButton.click();


            // await waitForProcessingToClear(
            //     page
            // );

// ========================================================
// 20. ESTIMATOR
// ========================================================

console.log(
    'Selecting Estimator...'
);

const estimatorButton =
    page.getByRole(
        'button',
        {
            name: 'Estimator',
            exact: true
        }
    );

await estimatorButton.waitFor({
    state: 'visible',
    timeout: 20000
});

await estimatorButton.click();

await waitForProcessingToClear(
    page
);
            // ========================================================
            // 21. BU MANAGER
            // ========================================================

            console.log(
                'Selecting BU Manager...'
            );


            const buManagerButton =
                page.getByRole(
                    'button',
                    {
                        name: 'BU Manager'
                    }
                );


            await buManagerButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await buManagerButton.click();


            await waitForProcessingToClear(
                page
            );


            // ========================================================
            // 22. FINAL PRICE
            // ========================================================

            console.log(
                'Entering Final Price...'
            );


            const finalPrice = page.getByRole(
                'textbox',
                {
                    name: 'Final Price'
                }
            );


            await finalPrice.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await finalPrice.fill(
                '25000'
            );


            // ========================================================
            // 23. UPDATE
            // ========================================================

            console.log(
                'Updating Evaluation...'
            );


            const manualContainer =
                page.locator(
                    '#P802_EVAL_NO_MANUAL_CONTAINER'
                );


            await manualContainer.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await manualContainer.click();


            const updateButton = page.getByRole(
                'button',
                {
                    name: 'Update'
                }
            );


            await updateButton.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await updateButton.click();


            await waitForProcessingToClear(
                page
            );


            await page.waitForTimeout(
                1500
            );


            // ========================================================
            // 24. ADMINISTRATOR
            // ========================================================

            console.log(
                'Selecting Administrator...'
            );


            const buManagerAgain =
                page.getByRole(
                    'button',
                    {
                        name: 'BU Manager'
                    }
                );


            await buManagerAgain.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await buManagerAgain.click();


            await waitForProcessingToClear(
                page
            );


            const administratorButton =
                page.getByRole(
                    'button',
                    {
                        name: 'Administrator'
                    }
                );


            await administratorButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await administratorButton.click();


            await waitForProcessingToClear(
                page
            );


            // ========================================================
            // 25. FINALIZE
            // ========================================================

            console.log(
                'Finalizing Evaluation...'
            );


            const finalizeButton =
                page.getByRole(
                    'button',
                    {
                        name: 'Finalize'
                    }
                );


            await finalizeButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await finalizeButton.click();


            const finalizeDialog =
                page.getByRole(
                    'alertdialog'
                );


            await finalizeDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await finalizeDialog
                .getByRole(
                    'button',
                    {
                        name: 'Finalize'
                    }
                )
                .click();


            await waitForProcessingToClear(
                page
            );


            // ========================================================
            // 26. SEND TO CC
            // ========================================================

            console.log(
                'Sending to CC...'
            );


            const sendCCButton =
                page.getByRole(
                    'button',
                    {
                        name: 'Send To CC'
                    }
                );


            await sendCCButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await sendCCButton.click();


            const ccDialog =
                page.getByRole(
                    'alertdialog'
                );


            await ccDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await ccDialog
                .getByRole(
                    'button',
                    {
                        name: 'Send To CC'
                    }
                )
                .click();


            await waitForProcessingToClear(
                page
            );


            // ========================================================
            // 27. APPROVE
            // ========================================================

            console.log(
                'Approving Evaluation...'
            );


            const approveButton =
                page.getByRole(
                    'button',
                    {
                        name: 'Approve'
                    }
                );


            await approveButton.waitFor({
                state: 'visible',
                timeout: 20000
            });


            await approveButton.click();


            const approveDialog =
                page.getByRole(
                    'alertdialog'
                );


            await approveDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });


            await approveDialog
                .getByRole(
                    'button',
                    {
                        name: 'Approve'
                    }
                )
                .click();


            await waitForProcessingToClear(
                page
            );


            // ========================================================
            // 29. HOME PAGE ACTION
            // ========================================================

            const homePageAction = page.locator(
                '#B483440241114424753'
            );

            await homePageAction.waitFor({
                state: 'visible',
                timeout: 20000
            });

            await homePageAction.click();


            // ========================================================
            // 30. SEARCH SUPPLIER
            // ========================================================

            const supplier = page.getByRole(
                'combobox',
                { name: 'Supplier' }
            );

            await supplier.waitFor({
                state: 'visible',
                timeout: 20000
            });

            await supplier.click();

            const supplierDialog = page.getByRole(
                'dialog',
                { name: 'Search' }
            );

            await supplierDialog.waitFor({
                state: 'visible',
                timeout: 15000
            });

            const supplierSearch = supplierDialog.getByRole(
                'textbox'
            );

            await supplierSearch.fill('venu');
            await supplierSearch.press('Enter');

            await supplierDialog.getByRole(
                'rowheader',
                { name: 'Venue Corporation and co' }
            ).click();

            await page.getByRole(
                'button',
                { name: 'Search', exact: true }
            ).click();


            // ========================================================
            // 31. FINAL VALIDATION
            // ========================================================

            await expect(
                page
            ).not.toHaveURL(
                /login/
            );


            console.log(
                '================================================'
            );

            console.log(
                'UCD Evaluation workflow completed successfully'
            );

            console.log(
                '================================================'
            );

        }
    );

});