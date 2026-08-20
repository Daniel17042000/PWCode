import {test} from '@playwright/test';
import { Login } from './POMLoginfile.spec';

test('Login test', async({page}) =>{
     
    const login = new Login(page);
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await login.Login('Admin', 'admin123');
    

});