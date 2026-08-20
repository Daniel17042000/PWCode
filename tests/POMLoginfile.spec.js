export class Login{
    constructor(page){
        this.page=page;
    }

    async Login(user,pass){

      await  this.page.fill('input[name="username"]', user);
      await  this.page.fill('input[name="password"]', pass);
       await this.page.getByRole('button',{name: 'Login'}).click();
       await this.page.waitForLoadState('networkidle');
    }


}