const url = 'https://script.google.com/macros/s/AKfycbxHhW4o1eFMKVozC-lEkEDC8yJkn8m-MLxNvIlT22ob7aoQl8w7vG77t0-7tfcT8jA5/exec';

async function testAll() {
  const id = 'new_url_test_' + Date.now();
  console.log('=== Testing NEW URL ===');

  console.log('1. addProduct');
  const r1 = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'addProduct', id, name: 'Initial', price: 100, category: 'pizza', description: 'D', image: 'I' })
  });
  console.log('   Result:', await r1.text());

  console.log('2. updateProduct');
  const r2 = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateProduct', id, name: 'Updated', price: 200, category: 'drink', description: 'D2', image: 'I2' })
  });
  console.log('   Result:', await r2.text());

  console.log('3. deleteProduct');
  const r3 = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteProduct', id })
  });
  console.log('   Result:', await r3.text());

  console.log('4. updateOrderStatus');
  const r4 = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateOrderStatus', id: '1', status: 'Delivered' })
  });
  console.log('   Result:', await r4.text());
}

testAll();
