const url = 'https://script.google.com/macros/s/AKfycbyscWl1x10vYTKW4kqTTnYlNx_dcqgB5Lvcm-CEowgWX1bPVI8GL4PL1qDxB4AiN4Q/exec';

async function check(action, payload = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload })
  });
  console.log(`${action}: ${await res.text()}`);
}

async function run() {
  await check('deleteProduct', { id: 'test_sync' });
}
run();
