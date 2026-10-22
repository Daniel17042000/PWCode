const {test,expect} = require('@playwright/test');

test('post request', async ({request}) => {
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {

        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer your_token_here',
            'accept': 'application/json'
        },
        data: {
            title: 'Fist Post',
            body: 'This is the body of the first post',
            userId: 1
        }

       
    });
    expect(response.status()).toBe(201);

    const data = await response.json();

    console.log(data);
    expect(data.title).toBe('Fist Post');
    expect(data.body).toBe('This is the body of the first post');
    expect(data.userId).toBe(1);
    expect(data.id).toBeTruthy();
});