const { test, expect } = require('@playwright/test');
 
// =====================================================
// TEST DATA
// =====================================================
 
const USERNAME = process.env.APP_USERNAME || 'Subiksha';
const PASSWORD = process.env.APP_PASSWORD || 'Subiksha@4321';
 
 
// =====================================================
// LOGIN
// =====================================================
 
async function login(page) {
 
  await page.goto(
    'https://dowellapps.com:8443/ords/r/manerp/aut129129/login',
    {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    }
  );
 
  const usernameField = page.getByRole('textbox', {
    name: 'Username'
  });
 
  await expect(usernameField).toBeVisible({
    timeout: 60000
  });
 
  await usernameField.fill(USERNAME);
 
  await page.getByRole('textbox', {
    name: 'Password'
  }).fill(PASSWORD);
 
  const signInButton = page.locator(
    '#B671672845046722778'
  );
 
  await expect(signInButton).toBeVisible({
    timeout: 30000
  });
 
  await expect(signInButton).toBeEnabled({
    timeout: 30000
  });
 
  await signInButton.click({
    force: true
  });
 
  await page.waitForURL(
    url => !url.pathname.endsWith('/login'),
    {
      timeout: 60000
    }
  );
 
  console.log('Login successful.');
  console.log('After login:', page.url());
}
 
 
// =====================================================
// EXPAND APEX TREE NODE
// =====================================================
 
async function expandTreeNode(page, name) {
 
  let treeitem = page.getByRole('treeitem', {
    name
  }).first();
 
  await expect(treeitem).toBeVisible({
    timeout: 15000
  });
 
  const expanded = await treeitem.getAttribute(
    'aria-expanded'
  );
 
  if (expanded === 'true') {
    return treeitem;
  }
 
  const li = treeitem.locator(
    'xpath=ancestor::li[1]'
  );
 
  const toggle = li.locator(
    '> .a-TreeView-toggle'
  );
 
  if (await toggle.count() > 0) {
    await toggle.click();
  } else {
    await treeitem.click();
  }
 
  await page.waitForTimeout(1000);
 
  treeitem = page.getByRole('treeitem', {
    name
  }).first();
 
  await expect(treeitem).toBeVisible({
    timeout: 15000
  });
 
  return treeitem;
}
 
 
// =====================================================
// OPEN MAIN MENU
// =====================================================
 
async function openMainMenu(page) {
 
  const launcher = page.locator(
    '#L201948268465196672'
  );
 
  await expect(launcher).toBeVisible({
    timeout: 60000
  });
 
  await launcher.click();
 
  await page.waitForTimeout(2000);
 
  console.log('Application Launcher opened.');
 
  const ucdMenu = page.getByRole('menuitem', {
    name: 'SALESMAN UCD - Mannai Used Car'
  });
 
  await expect(ucdMenu).toBeVisible({
    timeout: 30000
  });
 
  await ucdMenu.click();
 
  await expect(page).toHaveURL(
    /ucd-salesman-dashboard/,
    {
      timeout: 60000
    }
  );
 
  console.log('UCD application opened.');
  console.log('UCD URL:', page.url());
}
 
 
// =====================================================
// NAVIGATE TO CARS REG PLATE REPLACEMENT
// =====================================================
 
async function navigateToCarRegPlate(page) {
 
  await openMainMenu(page);
 
  const navigation = page.getByRole('tree', {
    name: 'Main Navigation'
  });
 
  await expect(navigation).toBeVisible({
    timeout: 30000
  });
 
  console.log('Main Navigation found.');
 
  await expandTreeNode(
    page,
    'Used Car Division'
  );
 
  console.log('Used Car Division opened.');
 
  await expandTreeNode(
    page,
    'Transactions'
  );
 
  console.log('Transactions opened.');
 
  const carRegPlate = page.getByRole('treeitem', {
    name: 'Cars Reg Plate Replacement'
  });
 
  await expect(carRegPlate).toBeVisible({
    timeout: 15000
  });
 
  await carRegPlate.click();
 
  await page.waitForLoadState(
    'domcontentloaded'
  ).catch(() => {});
 
  await page.waitForTimeout(2000);
 
  console.log(
    'Cars Reg Plate Replacement screen opened.'
  );
 
  console.log(
    'Current URL:',
    page.url()
  );
}
 
function generateRegisterNo() {
  const timestamp = Date.now().toString().slice(-7);
  const randomPart = Math.floor(100 + Math.random() * 900).toString();
 
  return timestamp + randomPart; // Exactly 10 digits
}
 
 
// =====================================================
// TEST
// =====================================================
 
test(
  'Car Reg Plate - select old record and update From Date',
  async ({ page }) => {
 
    test.setTimeout(180000);
 
    console.log('======================================');
    console.log('CAR REG PLATE TEST');
    console.log('======================================');
 
 
    // =================================================
    // LOGIN
    // =================================================
 
    await login(page);
 
 
    // =================================================
    // NAVIGATE TO CARS REG PLATE REPLACEMENT
    // =================================================
 
    await navigateToCarRegPlate(page);
 
 
    // =================================================
    // LANDING PAGE
    //
    // FIND FIRST RECORD WHERE:
    // FROM DATE < TODAY
    // =================================================
 
    await page.waitForTimeout(3000);
 
    console.log(
      'Searching landing page for record where From Date is before today...'
    );
 
 
    // =================================================
    // DATE COMPARISON INSIDE BROWSER
    // =================================================
 
    const matchInfo = await page.evaluate(() => {
 
      const months = {
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DEC: 11
      };
 
 
      // SYSTEM DATE / TODAY
 
      const sysdate = new Date();
 
      sysdate.setHours(
        0,
        0,
        0,
        0
      );
 
 
      // GET ALL TABLE ROWS
 
      const allRows = Array.from(
        document.querySelectorAll('tr')
      );
 
 
      // CHECK EACH ROW
 
      for (const row of allRows) {
 
        const cells = Array.from(
          row.querySelectorAll('td')
        );
 
        if (cells.length < 2) {
          continue;
        }
 
 
        // CHECK EACH CELL FOR DATE
 
        for (
          let c = 0;
          c < cells.length;
          c++
        ) {
 
          const text = (
            cells[c].innerText || ''
          ).trim();
 
 
          // EXPECTED DATE:
          // DD-MMM-YYYY
          //
          // Example:
          // 17-SEP-2026
 
          const match = text.match(
            /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/
          );
 
          if (!match) {
            continue;
          }
 
 
          const month =
            months[
              match[2].toUpperCase()
            ];
 
 
          if (month === undefined) {
            continue;
          }
 
 
          const fromDate = new Date(
            parseInt(match[3]),
            month,
            parseInt(match[1])
          );
 
 
          fromDate.setHours(
            0,
            0,
            0,
            0
          );
 
 
          // =================================================
          // IMPORTANT
          //
          // SELECT ONLY:
          // FROM DATE < TODAY
          // =================================================
 
          if (fromDate < sysdate) {
 
            return {
 
              vehicleNo:
                (
                  cells[1].innerText || ''
                ).trim(),
 
              fromDate:
                text,
 
              dateColIndex:
                c
            };
          }
        }
      }
 
 
      return null;
    });
 
 
    // =================================================
    // LOG MATCH
    // =================================================
 
    console.log(
      'Match found by browser:',
      JSON.stringify(matchInfo)
    );
 
 
    // =================================================
    // IF NO RECORD FOUND
    // =================================================
 
    if (!matchInfo) {
 
      await page.screenshot({
        path: 'debug-no-matching-row.png',
        fullPage: true
      });
 
      throw new Error(
        'No record found where From Date is before today.'
      );
    }
 
 
    // =================================================
    // SELECTED RECORD INFORMATION
    // =================================================
 
    console.log(
      `>>> Selected Record: Vehicle=${matchInfo.vehicleNo}, From Date=${matchInfo.fromDate}`
    );
 
 
    // =================================================
    // LOCATE SAME ROW
    // =================================================
 
    const targetRow = page.locator('tr').filter({
 
      has: page.locator('td', {
        hasText: matchInfo.vehicleNo
      })
 
    }).first();
 
 
    await expect(targetRow).toBeVisible({
      timeout: 10000
    });
 
 
    await targetRow.scrollIntoViewIfNeeded();
 
 
    // =================================================
    // CLICK PENCIL IN SAME ROW
    // =================================================
 
    const pencil = targetRow
      .locator('td')
      .first()
      .locator(
        'a, button, span[role="button"], [onclick]'
      )
      .first();
 
 
    await expect(pencil).toBeVisible({
      timeout: 10000
    });
 
 
    await pencil.click();
 
 
    console.log(
      'Old record opened successfully.'
    );
 
 
    // =================================================
    // EDIT SCREEN
    // =================================================
 
    await page.waitForTimeout(2000);
 
 
    // =================================================
    // REG NO
    //
    // DO NOT ENTER REG NO
    //
    // APPLICATION GENERATES IT AUTOMATICALLY
    // =================================================
 
    // =================================================
// REG NO
// =================================================
 
const registerNo = generateRegisterNo();
 
const registerNoField = page.locator('#P928_REG_NO');
 
await expect(registerNoField).toBeVisible({
  timeout: 30000
});
 
await registerNoField.fill(registerNo);
 
console.log(`Unique 10-digit Reg No entered: ${registerNo}`);
 
    console.log(
      'Reg No will be generated automatically.'
    );
 
 
    // =================================================
    // FROM DATE = TODAY
    // =================================================
 
    const today = new Date();
 
    const todayDay = today.getDate();
 
    console.log(
      `Today: ${today.toLocaleDateString()}`
    );
 
    console.log(
      `Selecting today's day: ${todayDay}`
    );
 
 
    // =================================================
    // OPEN FROM DATE
    // =================================================
 
    const fromDateField = page.locator(
      '#P928_FROM_DATE_input'
    );
 
 
    await expect(fromDateField).toBeVisible({
      timeout: 30000
    });
 
 
    await fromDateField.click();
 
 
    // =================================================
    // SELECT TODAY'S DATE
    // =================================================
 
    await page.getByRole('gridcell', {
      name: String(todayDay),
      exact: true
    }).click();
 
 
    // =================================================
    // DONE
    // =================================================
 
    await page.getByRole('button', {
      name: 'Done',
      exact: true
    }).click();
 
 
    console.log(
      'From Date changed to today.'
    );
 
 
    // =================================================
    // UPDATE
    // =================================================
 
    await page.getByRole('button', {
      name: 'Update',
      exact: true
    }).click();
 
 
    console.log(
      'Record updated successfully.'
    );
 
 
    // // =================================================
    // // PLATE REPLACEMENT HISTORY
    // // =================================================
 
    // await page.getByRole('button', {
    //   name: 'Plate Replacement History'
    // }).click();
 
 
    // console.log(
    //   'Plate Replacement History opened.'
    // );
 
 
    // // =================================================
    // // CLOSE HISTORY
    // // =================================================
 
    // await page.getByRole('button', {
    //   name: 'Close',
    //   description: 'Plate Replacement History'
    // }).click();
 
 
    // console.log(
    //   'Plate Replacement History closed.'
    // );
 // =================================================
// PLATE REPLACEMENT HISTORY
// =================================================
 
await page.getByRole('button', {
  name: 'Plate Replacement History'
}).click();
 
console.log(
  'Plate Replacement History opened.'
);
 
await page.waitForTimeout(2000);
 
 
// =================================================
// CLOSE HISTORY
// =================================================
 
const closeHistoryButton = page.getByRole('button', {
  name: 'Close',
  description: 'Plate Replacement History'
});
 
await expect(closeHistoryButton).toBeVisible({
  timeout: 30000
});
 
// IMPORTANT:
// Close causes APEX navigation.
// Do not make Playwright wait for that navigation.
await closeHistoryButton.click({
  noWaitAfter: true
}).catch(() => {});
 
console.log(
  'Plate Replacement History close action triggered.'
);
 
 
// =================================================
// WAIT FOR APEX TO RETURN TO CAR REG REPLACEMENT
// =================================================
 
await page.waitForTimeout(5000);
 
console.log(
  'Waiting for Car Reg Replacement page...'
);
 
 
// Check that the edit form is available again
const regNoField = page.locator('#P928_REG_NO');
 
await expect(regNoField).toBeVisible({
  timeout: 30000
});
 
console.log(
  'Car Reg Replacement page is active again.'
);
 
 
// =================================================
// BACK
// =================================================
 
const backButton = page.getByRole('button', {
  name: 'Back',
  exact: true
});
 
await expect(backButton).toBeVisible({
  timeout: 30000
});
 
await backButton.click({
  noWaitAfter: true
}).catch(() => {});
 
console.log(
  'Back clicked successfully.'
);
 
await page.waitForTimeout(3000);
    //=================================================
    //BACK
    //=================================================
 
    // await page.getByRole('button', {
    //   name: 'Back',
    //   exact: true
    // }).click();
 
 
    // console.log(
    //   'Back clicked.'
    // );
 
 
    // =================================================
    // OPEN CAR NO LOV
    // =================================================
 
    await page.locator(
      '#P927_CAR_NO_lov_btn'
    ).click();
 
 
    console.log(
      'Car No LOV opened.'
    );
 
 
    // =================================================
    // SEARCH DIALOG
    // =================================================
 
    const searchDialog = page.getByRole(
      'dialog',
      {
        name: 'Search'
      }
    );
 
 
    await expect(searchDialog).toBeVisible({
      timeout: 30000
    });
 
 
    const searchBox =
      searchDialog.getByRole('textbox');
 
  // =================================================
// SEARCH CAR NO
// USE VEHICLE NO FROM THE SELECTED RECORD
// =================================================
 
const vehicleNo = matchInfo.vehicleNo;
 
console.log(
  `Searching newly selected Vehicle No: ${vehicleNo}`
);
 
await searchBox.fill(vehicleNo);
 
await searchBox.press('Enter');
 
console.log(
  `Car No search executed for Vehicle No: ${vehicleNo}`
);
 
 
// =================================================
// SELECT CAR NO
// =================================================
 
await page.getByRole('rowheader', {
  name: vehicleNo,
  exact: true
}).click();
 
console.log(
  `Car No ${vehicleNo} selected.`
);
    // // =================================================
    // // SEARCH CAR NO
    // // =================================================
 
    // await searchBox.fill('4301');
 
    // await searchBox.press('Enter');
 
 
    // console.log(
    //   'Car No search executed.'
    // );
 
 
    // // =================================================
    // // SELECT CAR NO
    // // =================================================
 
    // await page.getByRole('rowheader', {
    //   name: '4301',
    //   exact: true
    // }).click();
 
 
    // console.log(
    //   'Car No 4301 selected.'
    // );
 
 
    // =================================================
    // SEARCH
    // =================================================
 
    await page.getByRole('button', {
      name: 'Search',
      exact: true
    }).click();
 
 
    console.log(
      'Search button clicked.'
    );
 
 
    // =================================================
    // EDIT
    //
    // There are multiple Edit links on the results page.
    // Select the FIRST one.
    // =================================================
 
    const editLink = page.getByRole('link', {
      name: 'Edit',
      exact: true
    }).first();
 
 
    await expect(editLink).toBeVisible({
      timeout: 30000
    });
 
 
    await editLink.click();
 
 
    console.log(
      'First Edit record opened.'
    );
 
 
    // =================================================
    // BACK
    // =================================================
 
    await page.getByRole('button', {
      name: 'Back',
      exact: true
    }).click();
 
 
    console.log(
      'Back clicked.'
    );
 
 
    // =================================================
    // CLEAR
    // =================================================
 
    await page.getByRole('button', {
      name: 'Clear',
      exact: true
    }).click();
 
 
    console.log(
      'Form cleared.'
    );

    await page.getByRole('button', { name: 'Actions' }).click();
    await page.locator('span').filter({ hasText: 'Download' }).click();
    await page.getByLabel('Excel').click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
 
 
    // =================================================
    // TEST COMPLETED
    // =================================================
 
    console.log('======================================');
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('======================================');
}
);
 