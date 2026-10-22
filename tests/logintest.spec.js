const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

    test('logs in successfully', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('Daniel', 'Daniel@1234');
    });