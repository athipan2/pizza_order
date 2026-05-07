const urls = {
  "URL 1 (Original)": "https://script.google.com/macros/s/AKfycby8OBQceiLO3dzzWh5IGP3jnSAg8dAH55OgApUsyWNH6bXJCBXhrq5rYGdDyFgh5Npf/exec",
  "URL 2 (Memory)": "https://script.google.com/macros/s/AKfycbyscWl1x10vYTKW4kqTTnYlNx_dcqgB5Lvcm-CEowgWX1bPVI8GL4PL1qDxB4AiN4Q/exec"
};

async function test(name, url) {
  console.log(`=== Testing ${name} ===`);
  const actions = ['addProduct', 'updateProduct', 'deleteProduct', 'addOrder', 'updateOrderStatus'];
  for (const action of actions) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, id: 'test_sync', name: 'T', price: 1, category: 'c', description: 'd', image: 'i', status: 'S', cartItems: '[]' })
      });
      const text = await res.text();
      console.log(`  ${action}: ${text}`);
    } catch (e) {
      console.log(`  ${action}: Error - ${e.message}`);
    }
  }
}

async function run() {
  await test("URL 1 (Original)", urls["URL 1 (Original)"]);
  await test("URL 2 (Memory)", urls["URL 2 (Memory)"]);
}

run();
