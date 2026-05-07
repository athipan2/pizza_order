const url = 'https://script.google.com/macros/s/AKfycbyscWl1x10vYTKW4kqTTnYlNx_dcqgB5Lvcm-CEowgWX1bPVI8GL4PL1qDxB4AiN4Q/exec';

async function testEdit() {
  const id = 'test_' + Date.now();

  console.log('1. Adding a product to ensure it exists...');
  const addRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'addProduct',
      id: id,
      name: 'Original Name',
      price: 100,
      category: 'pizza',
      description: 'Original Desc',
      image: 'https://via.placeholder.com/150'
    })
  });
  console.log('Add Result:', await addRes.text());

  console.log('2. Attempting to Edit (updateProduct)...');
  const editRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'updateProduct',
      id: id,
      name: 'Updated Name',
      price: 200,
      category: 'drink',
      description: 'Updated Desc',
      image: 'https://via.placeholder.com/150'
    })
  });
  const editResultText = await editRes.text();
  console.log('Edit Result:', editResultText);

  console.log('3. Verifying the change...');
  const getRes = await fetch(`${url}?action=getProducts&_=${Date.now()}`);
  const products = await getRes.json();
  const updatedProduct = products.find(p => p.id.toString() === id);

  if (updatedProduct) {
    console.log('Product found in list:', updatedProduct);
    if (updatedProduct.name === 'Updated Name' && updatedProduct.category === 'drink') {
      console.log('SUCCESS: Product was updated correctly!');
    } else {
      console.log('FAILURE: Product found but data matches original or is incorrect.');
    }
  } else {
    console.log('FAILURE: Product not found in the list after edit attempt.');
  }

  // Cleanup is hard if deleteProduct doesn't work, but let's try
  console.log('4. Attempting to Delete...');
  const delRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'deleteProduct', id: id })
  });
  console.log('Delete Result:', await delRes.text());
}

testEdit();
