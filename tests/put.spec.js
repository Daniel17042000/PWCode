const{test,expect}=require('@playwright/test');
test('Post API Test',async({request})=>{
  const response=await request.put('https://jsonplaceholder.typicode.com/posts/1', {
    data: {
      id: 1,
      title: 'Updated Title',
      body: 'Updated Body',
      userId: 1
    }
  });
  expect(response.status()).toBe(200);

  const data=await response.json();
    console.log(data);  
    expect(data.id).toBe(1);
    expect(data.title).toBe('Updated Title');
    expect(data.body).toBe('Updated Body');
    expect(data.userId).toBe(1);
});